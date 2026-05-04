# TASK-401: pgTAP regression tests for RLS policies

**Task ID**: TASK-401
**Title**: Automated RLS test suite via pgTAP, runnable via `supabase test db`
**Status**: 🔲 To Do (blocked: needs live Supabase backend)
**Priority**: High
**Created**: 2026-05-04
**Assigned To**: Warren de Leon
**Category**: Security / Database Testing
**Epic**: EPIC-029 (Security Audit)

---

## Context

Today no automated test catches an accidental RLS regression. If a future
migration disables a policy, sets `USING (true)`, GRANTs SELECT to `anon`
on a private table, or drops a policy in the middle of a refactor, nothing
fails until production. RLS regressions are silent, dangerous, and exactly
the class of bug a test net catches well.

pgTAP runs SQL assertions against a real Postgres instance. Supabase
ships first-class support via `supabase test db` which executes any
`*.sql` file under `supabase/tests/` against the local database with
pgTAP loaded. The tests run identically in CI.

**Blocked**: the Supabase backend is currently torn down. This work
requires `supabase start` (a local Postgres in Docker) to develop against
and the schema to be applied. Pick this up alongside TASK-400 when the
backend is restored.

## Problem

1. **Migrations can silently break RLS.** A `DROP POLICY ... IF EXISTS`
   followed by a forgotten re-CREATE leaves the table open. Reviewers
   miss this in PR.
2. **Cross-user reads are the highest-blast-radius RLS bug.** "User A
   can read User B's data" is a customer-facing breach, not a
   degradation. The only way to be sure is to test it.
3. **Storage path constraints are easy to get wrong.** The standard
   pattern `(storage.foldername(name))[1] = (select auth.uid()::text)` is
   subtle — wrong subscript, wrong cast, wrong join all break it
   silently.

## Solution

### Layout

```
supabase/
  tests/
    helpers/
      auth.sql          -- helpers to set role and JWT claims
    rls/
      00_anon_read.sql  -- anon role cannot SELECT private tables
      01_user_isolation.sql  -- user A cannot read user B's row
      02_storage_paths.sql   -- storage paths constrained to auth.uid()
    rate_limit/
      00_check_rate_limit.sql  -- TASK-400's tests live here
```

Filenames are sorted lexicographically by the runner; the numeric prefix
keeps related tests grouped.

### Helper: `supabase/tests/helpers/auth.sql`

```sql
-- Helpers for impersonating roles and users inside a pgTAP test.
-- Each test is wrapped in BEGIN/ROLLBACK so impersonation is local.

CREATE OR REPLACE FUNCTION public.test_set_anon()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '{"role": "anon"}'::text, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.test_set_authenticated(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('role', 'authenticated', 'sub', p_user_id::text)::text,
    true
  );
END;
$$;
```

Note: these helpers are dev-only and should be removed before deploy
(or guarded by `IF current_setting('app.environment') = 'test'`).
The pattern in the Supabase docs is to keep them in `supabase/tests/`
and never apply via migration, so they exist only in the local
`supabase test db` run.

### Test 1: anon cannot SELECT private tables

`supabase/tests/rls/00_anon_read.sql`

```sql
BEGIN;
SELECT plan(4);

-- Iterate every public table that should be private and assert anon
-- gets zero rows. Add tables here as the schema grows.
SELECT public.test_set_anon();

SELECT is_empty(
  $$ SELECT 1 FROM public.user_profiles LIMIT 1 $$,
  'anon cannot SELECT user_profiles'
);

SELECT is_empty(
  $$ SELECT 1 FROM public.rate_limit_log LIMIT 1 $$,
  'anon cannot SELECT rate_limit_log'
);

SELECT is_empty(
  $$ SELECT 1 FROM public.storage_cleanup_queue LIMIT 1 $$,
  'anon cannot SELECT storage_cleanup_queue'
);

-- Negative control: ensure pgTAP itself is wired up
SELECT pass('pgTAP is loaded');

SELECT * FROM finish();
ROLLBACK;
```

### Test 2: cross-user isolation

`supabase/tests/rls/01_user_isolation.sql`

```sql
BEGIN;
SELECT plan(3);

-- Seed two users and one row owned by each.
INSERT INTO auth.users (id, email)
  VALUES ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
         ('22222222-2222-2222-2222-222222222222', 'b@example.com')
  ON CONFLICT (id) DO NOTHING;

-- Replace `user_profiles` with whatever per-user tables exist when this
-- runs. The pattern below applies to any table with a `user_id` column.
INSERT INTO public.user_profiles (user_id, display_name)
  VALUES ('11111111-1111-1111-1111-111111111111', 'A'),
         ('22222222-2222-2222-2222-222222222222', 'B');

-- User A's view: sees A's row, not B's
SELECT public.test_set_authenticated('11111111-1111-1111-1111-111111111111');

SELECT results_eq(
  $$ SELECT display_name FROM public.user_profiles ORDER BY display_name $$,
  $$ VALUES ('A'::text) $$,
  'user A sees only their own row'
);

-- User B's view: sees B's row, not A's
SELECT public.test_set_authenticated('22222222-2222-2222-2222-222222222222');

SELECT results_eq(
  $$ SELECT display_name FROM public.user_profiles ORDER BY display_name $$,
  $$ VALUES ('B'::text) $$,
  'user B sees only their own row'
);

-- Direct UPDATE of the other user's row must fail or affect zero rows
SELECT public.test_set_authenticated('11111111-1111-1111-1111-111111111111');

SELECT results_eq(
  $$ UPDATE public.user_profiles
        SET display_name = 'hacked'
      WHERE user_id = '22222222-2222-2222-2222-222222222222'
      RETURNING 1 $$,
  $$ SELECT 1 WHERE FALSE $$,
  'user A cannot UPDATE user B row'
);

SELECT * FROM finish();
ROLLBACK;
```

### Test 3: storage path constraints

`supabase/tests/rls/02_storage_paths.sql`

```sql
BEGIN;
SELECT plan(2);

-- The `profile-pictures` bucket policy should only let a user touch
-- objects under {their-uuid}/...

INSERT INTO auth.users (id, email)
  VALUES ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
         ('22222222-2222-2222-2222-222222222222', 'b@example.com')
  ON CONFLICT (id) DO NOTHING;

SELECT public.test_set_authenticated('11111111-1111-1111-1111-111111111111');

-- Allowed: own folder
SELECT lives_ok(
  $$ INSERT INTO storage.objects (bucket_id, name, owner)
       VALUES ('profile-pictures',
               '11111111-1111-1111-1111-111111111111/avatar.jpg',
               '11111111-1111-1111-1111-111111111111') $$,
  'user A can write to own folder'
);

-- Denied: someone else's folder
SELECT throws_ok(
  $$ INSERT INTO storage.objects (bucket_id, name, owner)
       VALUES ('profile-pictures',
               '22222222-2222-2222-2222-222222222222/stolen.jpg',
               '11111111-1111-1111-1111-111111111111') $$,
  '42501', -- insufficient_privilege
  NULL,
  'user A cannot write to user B folder'
);

SELECT * FROM finish();
ROLLBACK;
```

### Test 4: rate limit (folded in from TASK-400)

`supabase/tests/rate_limit/00_check_rate_limit.sql`

```sql
BEGIN;
SELECT plan(4);

INSERT INTO auth.users (id, email)
  VALUES ('11111111-1111-1111-1111-111111111111', 'a@example.com')
  ON CONFLICT (id) DO NOTHING;

SELECT public.test_set_authenticated('11111111-1111-1111-1111-111111111111');

-- 5 calls within the window should all succeed
SELECT lives_ok(
  $$ SELECT public.check_rate_limit('test_action', 5, 3600) $$,
  'call 1 of 5 succeeds'
);
SELECT lives_ok(
  $$ SELECT public.check_rate_limit('test_action', 5, 3600);
     SELECT public.check_rate_limit('test_action', 5, 3600);
     SELECT public.check_rate_limit('test_action', 5, 3600);
     SELECT public.check_rate_limit('test_action', 5, 3600); $$,
  'calls 2-5 succeed'
);

-- 6th call within the window must raise
SELECT throws_ok(
  $$ SELECT public.check_rate_limit('test_action', 5, 3600) $$,
  'P0001',
  'rate_limit_exceeded',
  'call 6 raises rate_limit_exceeded'
);

-- Direct table access from authenticated must fail
SELECT throws_ok(
  $$ SELECT * FROM public.rate_limit_log $$,
  '42501',
  NULL,
  'authenticated cannot SELECT rate_limit_log directly'
);

SELECT * FROM finish();
ROLLBACK;
```

### CI integration

Add to `.github/workflows/` (or wherever CI lives — confirm at
implementation time, the GitLab → GitHub migration is in flight per the
project memory):

```yaml
db-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: supabase/setup-cli@v1
      with:
        version: latest
    - run: supabase start
    - run: supabase test db
    - run: supabase stop
```

`supabase test db` returns non-zero on any pgTAP failure; CI fails the job.

## Acceptance Criteria

- [ ] `supabase/tests/helpers/auth.sql` provides `test_set_anon` and
      `test_set_authenticated(uuid)`
- [ ] One pgTAP file per concern under `supabase/tests/rls/` and
      `supabase/tests/rate_limit/`
- [ ] All tests wrapped in `BEGIN; ... ROLLBACK;` so they don't pollute
      the local DB
- [ ] `supabase test db` runs the full suite green locally
- [ ] CI pipeline runs `supabase test db` on every PR that touches
      `supabase/migrations/**` or `supabase/tests/**`
- [ ] Anon-read assertion enumerates every private table in `public.*`
      (one assertion per table)
- [ ] Cross-user isolation tested for at least the user_profiles +
      whatever other per-user tables exist at implementation time
- [ ] Storage policy tested for both allowed and denied paths
- [ ] Rate-limit function tested per TASK-400 acceptance criteria

## Pre-implementation checklist

When the backend is restored, verify before starting:

1. [ ] `supabase init` has been run (look for `supabase/config.toml`)
2. [ ] `supabase start` succeeds locally (Docker / Colima running)
3. [ ] Existing migrations apply cleanly via `supabase db reset`
4. [ ] List of private tables is captured (`\dt public.*` minus public
       reference data) so the anon-read test enumerates correctly

## Related work

- TASK-400 (rate-limit infrastructure) ships migrations whose RLS this
  suite locks in
- `supabase/migrations/20241204_storage_cleanup_queue.sql` — the existing
  `storage_cleanup_queue` table is one of the tables whose RLS the
  anon-read test should cover
- EPIC-029 (Security Audit & Penetration Testing) — this is the automated
  half; the manual pen test is the other half

## Source

Surfaced as FU-03 in `~/.wiki/wiki/personal/portfolio-app/rn-project-roadmap.md`
during the May 2026 blog series review. Status changed from "ready to
implement" to "blocked on backend restoration" on 2026-05-04 when the
Supabase backend was confirmed torn down.
