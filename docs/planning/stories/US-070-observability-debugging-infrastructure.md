# US-070: Observability & Debugging Infrastructure

**Story ID**: US-070
**Title**: Observability & Debugging Infrastructure
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Observability

---

## User Story

As a **developer**,
I want **full debugging infrastructure including Redux breadcrumbs, environment configuration, and documented logging patterns**,
So that **I can quickly diagnose production issues with full context of user actions and app state**.

---

## Context & Rationale

### Problem Statement

When a production error occurs, there is insufficient context to understand what the user was doing or what state the app was in. Redux actions, which drive most app behaviour, are not tracked.

### Current State

- Redux debugging only via Reactotron (development)
- No breadcrumb trail of user actions
- Environment configuration scattered
- No documentation for logging patterns

### Desired State

- Redux actions logged as Sentry breadcrumbs (production)
- Failed async thunks automatically captured as errors
- Centralised environment configuration for Sentry
- Documented logging strategy for team reference
- Full test coverage for enhanced logger

### Why Now

- Redux actions are critical context for debugging
- Environment configuration needed before first production deploy
- Documentation ensures consistent logging practices

---

## Acceptance Criteria

- [ ] Redux middleware logs actions as Sentry breadcrumbs
- [ ] Failed async thunks captured as Sentry errors
- [ ] Sensitive state masked using existing `maskSensitiveData()`
- [ ] Noisy actions filtered (persist/rehydrate)
- [ ] `.env.development` and `.env.production` configured for Sentry
- [ ] Sentry disabled in development via environment variable
- [ ] Enhanced logger has 100% RNTL test coverage
- [ ] Logging strategy documented in `.claude/docs/logging-guide.md`
- [ ] `yarn validate` passes with 0 errors

---

## Story Points & Effort

**Story Points**: 5
**Effort Estimate**: 6 hours
**Actual Effort**: TBD

---

## Tasks

| ID                                                                | Task                                 | Effort | Status   |
| ----------------------------------------------------------------- | ------------------------------------ | ------ | -------- |
| [TASK-379](../tasks/TASK-379-redux-breadcrumb-middleware.md)      | Create Redux Breadcrumb Middleware   | 1.5h   | 📋 To Do |
| [TASK-380](../tasks/TASK-380-environment-configuration-sentry.md) | Environment Configuration for Sentry | 1h     | 📋 To Do |
| [TASK-381](../tasks/TASK-381-rntl-tests-enhanced-logger.md)       | RNTL Tests for Enhanced Logger       | 2h     | 📋 To Do |
| [TASK-382](../tasks/TASK-382-logging-strategy-documentation.md)   | Documentation for Logging Strategy   | 1.5h   | 📋 To Do |

---

## Technical Notes

### Redux Middleware

```typescript
const sentryMiddleware: Middleware = () => next => action => {
  // Filter noisy actions
  if (!action.type.startsWith('persist/')) {
    Sentry.addBreadcrumb({
      category: 'redux',
      message: action.type,
      level: 'info',
      data: maskSensitiveData(action.payload),
    });
  }

  // Capture failed thunks
  if (action.type.endsWith('/rejected')) {
    Sentry.captureMessage(`Redux thunk failed: ${action.type}`, {
      level: 'error',
      extra: { error: action.error },
    });
  }

  return next(action);
};
```

### Environment Variables

```bash
# .env.production
SENTRY_DSN=https://xxx@xxx.ingest.de.sentry.io/xxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.2

# .env.development
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373, TASK-374 (Sentry SDK and logger enhancement must be complete)

**Blocks**: None

---

**Last Updated**: 2025-12-08
