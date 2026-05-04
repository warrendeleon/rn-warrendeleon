# TASK-399: Wire maskSensitiveData into Sentry beforeSend and beforeBreadcrumb

**Task ID**: TASK-399
**Title**: Make Sentry SDK install + maskSensitiveData wiring atomic in one PR
**Status**: 🔲 To Do
**Priority**: Critical (blocking gate for EPIC-032)
**Created**: 2026-05-04
**Assigned To**: Warren de Leon
**Category**: Observability / Security
**Epic**: EPIC-032

---

## Context

`@sentry/react-native` is not yet installed (`logger.ts` has a TODO comment;
nothing in `package.json`). The PR that adds Sentry must also wire the
existing `src/utils/logging/maskSensitiveData.ts` utility into both Sentry
hooks — `beforeSend` and `beforeBreadcrumb` — and ship a test that verifies
the wiring.

## Problem

Sentry without `beforeSend` and `beforeBreadcrumb` callbacks ships PII
off-device on every captured event and on every navigation / API breadcrumb.
The masking utility already exists and is used by the in-app logger, but
Sentry runs through a different path. Adding the SDK before wiring the
scrub callbacks creates a window — one PR, one deploy, one TestFlight
build — where production traffic leaks PII.

The order matters and is one-way: install SDK → wire scrub callbacks → turn
it on. Never the reverse. A PR that lands "I'll add the masking next" is
the wrong shape for this work.

## Solution

In the same PR that adds `@sentry/react-native`:

1. Wrap `maskSensitiveData` for Sentry's event shape and wire it into
   `beforeSend`:

```typescript
import * as Sentry from '@sentry/react-native';
import { maskSensitiveData } from '@app/utils/logging/maskSensitiveData';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.NODE_ENV,
  beforeSend(event) {
    // Scrub user, request, extra, contexts, tags, exception messages
    return maskSensitiveData(event) as Sentry.Event;
  },
  beforeBreadcrumb(breadcrumb) {
    return maskSensitiveData(breadcrumb) as Sentry.Breadcrumb;
  },
  // ... rest of EPIC-032 configuration
});
```

2. Add an integration test (`src/utils/logging/__tests__/sentry-masking.rntl.ts`)
   that:
   - Mocks `Sentry.init` and captures the `beforeSend` / `beforeBreadcrumb`
     callbacks passed to it
   - Constructs a representative Sentry event containing a JWT in
     `request.headers.Authorization`, an email in `user.email`, a password
     in `extra.requestBody.password`, and a phone in `breadcrumb.data.phone`
   - Asserts each callback returns a scrubbed copy with the placeholders
     `[MASKED_TOKEN]`, `[MASKED_EMAIL]`, `[MASKED]`, `[MASKED_PHONE]` in
     the corresponding fields
   - Asserts the original input object is not mutated

3. Add a snapshot test (`src/utils/logging/__tests__/sentry-masking.snapshot.rntl.ts`)
   that renders a fixture event through the wired `beforeSend` and snapshots
   the masked output. This is the regression net: any future change to the
   masker that lets PII through Sentry will fail the snapshot loudly.

4. **Pre-merge verification checklist** (in the PR description):
   - [ ] `@sentry/react-native` added to `package.json`
   - [ ] `Sentry.init(...)` includes both `beforeSend` and `beforeBreadcrumb`
   - [ ] `beforeSend` test asserts JWT, email, password, phone are scrubbed
   - [ ] `beforeBreadcrumb` test asserts breadcrumb.data is scrubbed
   - [ ] Snapshot test exists and is green
   - [ ] Sentry DSN read from env via Zod-validated `react-native-config`,
         not hardcoded

## Why a separate task instead of bullets in EPIC-032?

EPIC-032 has 11 tasks. The masking wiring is easy to deprioritise as
"detail" against the bigger items (DSN management, source maps, navigation
breadcrumbs). It is not a detail. A single missed PR turns the SDK install
into a PII leak. Pulling it out as its own gating TASK-399, blocking on
the same PR as SDK install, makes the dependency explicit.

## Related work

- `src/utils/logging/maskSensitiveData.ts` — the masker (FU-09 tightened
  PHONE_US, dropped CREDIT_CARD)
- `docs/planning/epics/EPIC-032-production-logging-error-tracking.md` —
  parent epic
- Blog post: "Logging Without Leaking" (warrendeleon.com, May 2026 series)

## Acceptance Criteria

- [ ] Same PR adds `@sentry/react-native` AND wires `maskSensitiveData`
      into `beforeSend` + `beforeBreadcrumb`
- [ ] Integration test covering JWT, email, password, phone in event +
      breadcrumb shapes passes
- [ ] Snapshot test of a representative scrubbed event passes
- [ ] PR description checklist (above) is filled in before merge
- [ ] No prior PR ships Sentry init without the callbacks

## Source

Surfaced as FU-04 in `~/.wiki/wiki/personal/portfolio-app/rn-project-roadmap.md`
during the May 2026 blog series review.
