# TASK-400: Rate-limit infrastructure for Supabase RPC calls

**Task ID**: TASK-400
**Title**: rate_limit_log table + check_rate_limit SECURITY DEFINER function + pg_cron prune
**Status**: 🔲 To Do (blocked: needs live Supabase backend)
**Priority**: High
**Created**: 2026-05-04
**Assigned To**: Warren de Leon
**Category**: Security / Backend
**Epic**: EPIC-029 (Security Audit) — or new EPIC-034 if it grows beyond rate limiting

---

## Context

There is currently no per-user rate limit on RPC calls in the Supabase
backend. The anon key is embedded in every release of the mobile client and
must be treated as public (anyone with the IPA / APK can extract it). That
key plus an expensive RPC equals an unbounded bill or a denial of
service — there is nothing between an attacker and the database except the
RPC's own work.

This task lands a generic rate-limit primitive (table + SECURITY DEFINER
function + scheduled prune) and wires it into one representative RPC as the
worked example. Future RPCs add one line: `PERFORM check_rate_limit(...)`.

**Blocked**: the Supabase backend is currently torn down. Pick this up the
moment it's restored.

## Problem

1. **No throttling exists.** Any caller with the anon key can hammer any
   RPC at network speed. Even cheap RPCs become expensive at 1000 req/s.
2. **Future RPCs will all need the same plumbing.** Without a primitive,
   each RPC would reinvent throttling, badly. The pattern below is the
   canonical Supabase community approach (table + SECURITY DEFINER + cron).
3. **Per-user, not per-IP.** Behind NAT / corporate proxies, IP-based
   limits punish legitimate users. Tying the limit to `auth.uid()` means
   each authenticated user gets their own bucket; anonymous calls can
   share a single bucket keyed on the (action, NULL) pair if needed.

## Solution

### Migration: `supabase/migrations/<YYYYMMDDHHMMSS>_rate_limit_infrastructure.sql`

```sql
-- Rate Limit Infrastructure
--
-- Provides a generic per-user, per-action rate limit primitive used by
-- expensive RPCs. Logs every limited call into rate_limit_log and a
-- SECURITY DEFINER function counts the recent rows for the (user, action)
-- pair against a configurable ceiling.

-- 1. The log table
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index that the count query hits. The order is critical:
-- (user_id, action, occurred_at DESC) so the planner uses the index for
-- both the WHERE and the time-window filter without a sort.
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_user_action_time
  ON public.rate_limit_log (user_id, action, occurred_at DESC);

-- 2. RLS: only the SECURITY DEFINER function should write/read this.
-- No policies = anon and authenticated cannot touch it directly.
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- 3. The check function. SECURITY DEFINER so it runs as the table owner
-- and bypasses RLS. SET search_path is mandatory on SECURITY DEFINER
-- functions to prevent search-path hijacking attacks (Supabase Advisors
-- will flag this).
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_max_per_window INT,
  p_window_seconds INT DEFAULT 3600
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_count INT;
BEGIN
  -- Anonymous callers also get a bucket (NULL user_id, partitioned by
  -- action). If you need to disallow anon entirely, raise here instead.
  SELECT COUNT(*)
    INTO v_count
    FROM public.rate_limit_log
   WHERE user_id IS NOT DISTINCT FROM v_user_id
     AND action = p_action
     AND occurred_at > NOW() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max_per_window THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001',
            HINT = format('Limit %s/%s seconds for action %s',
                          p_max_per_window, p_window_seconds, p_action);
  END IF;

  INSERT INTO public.rate_limit_log (user_id, action)
       VALUES (v_user_id, p_action);
END;
$$;

-- 4. Grant EXECUTE so authenticated and anon roles can call the function
-- (the function itself is what enforces the limit; the table stays locked).
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT)
  TO anon, authenticated;

-- 5. Scheduled prune via pg_cron. Keep 30 days for audit trails; tune
-- per actual retention need.
-- Requires the pg_cron extension to be enabled in the Supabase project
-- (Database > Extensions > pg_cron). On Supabase, pg_cron runs in the
-- "postgres" database.
SELECT cron.schedule(
  'prune-rate-limit-log',
  '0 3 * * *', -- 03:00 UTC daily
  $$ DELETE FROM public.rate_limit_log
      WHERE occurred_at < NOW() - INTERVAL '30 days' $$
);

COMMENT ON TABLE public.rate_limit_log IS
  'Per-user, per-action call log. Read/written only by check_rate_limit().';
COMMENT ON FUNCTION public.check_rate_limit(TEXT, INT, INT) IS
  'Throttles RPC calls. Raises rate_limit_exceeded (P0001) when over.';
```

### Wiring into a representative RPC

Pick the most expensive existing RPC as the worked example. If none exist
yet at the time of implementation, scaffold one (e.g. `request_data_export`
which would otherwise be a perfect target — large I/O, low normal call rate,
high abuse value).

```sql
CREATE OR REPLACE FUNCTION public.request_data_export()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 5 calls per hour per user
  PERFORM public.check_rate_limit('request_data_export', 5, 3600);

  -- ... real RPC body ...
END;
$$;
```

### Client-side handling (RN app)

The interceptor must surface `rate_limit_exceeded` to the user as a
recoverable error, not a generic failure. In `SupabaseAuthClient.handleError`
(or a new `SupabaseRpcClient.handleError` if RPCs get their own client),
add:

```typescript
if (errorCode === 'rate_limit_exceeded' || axiosError.response?.status === 429) {
  return new AuthError('Too many requests. Please try again later.', 'rate_limit_exceeded');
}
```

The Supabase Postgrest layer maps `RAISE EXCEPTION ... ERRCODE = 'P0001'`
to HTTP 400 with `{ code: 'P0001', message: 'rate_limit_exceeded', hint: ... }`,
which is what the client sees.

## pgTAP coverage (folds into TASK-401)

Co-locate these assertions in TASK-401's pgTAP suite rather than in a
separate test file:

- `check_rate_limit` raises after the Nth call within the window
- `check_rate_limit` does NOT raise on the (N-1)th call
- The table is unreachable from anon and authenticated roles directly
- The cron job exists in `cron.job` with the expected name and schedule

## Acceptance Criteria

- [ ] Migration applies cleanly via `supabase db push`
- [ ] `pg_cron` extension enabled in the Supabase project before merge
- [ ] `check_rate_limit` is SECURITY DEFINER with `SET search_path`
      (Supabase Advisors check passes, no `function_search_path_mutable`
      warning)
- [ ] Function is callable by `anon` and `authenticated` (GRANT EXECUTE)
- [ ] Direct SELECT/INSERT/UPDATE on `rate_limit_log` from `anon` and
      `authenticated` is denied
- [ ] At least one production RPC calls `PERFORM check_rate_limit(...)`
      at the top of its body
- [ ] Client maps the `rate_limit_exceeded` error to a user-friendly
      message
- [ ] pgTAP tests (TASK-401) cover the four assertions above

## Operational notes

- **Choosing limits**: Defaults of 5/hour and 1/minute are starting points.
  Watch the `rate_limit_log` table after deploy and tune. A real attack
  shows up as a flat line at the limit; a real user shows up as bursts.
- **NULL user buckets**: All anon calls share the (NULL, action) bucket.
  This is intentional — anon shouldn't have access to expensive RPCs at
  all in most cases.
- **Cost**: At 30 days retention and a few hundred RPC calls per user per
  day, the table stays in single-digit MB. The composite index makes the
  count query an index-only scan.
- **Why not a sliding-window in Redis**: Supabase doesn't ship Redis. A
  Postgres-only solution removes one moving piece. The COUNT is fast
  enough at the rate limits we care about.

## Source

Surfaced as FU-02 in `~/.wiki/wiki/personal/portfolio-app/rn-project-roadmap.md`
during the May 2026 blog series review. Status changed from "ready to
implement" to "blocked on backend restoration" on 2026-05-04 when the
Supabase backend was confirmed torn down.
