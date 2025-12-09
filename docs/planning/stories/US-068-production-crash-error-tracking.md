# US-068: Production Crash & Error Tracking

**Story ID**: US-068
**Title**: Production Crash & Error Tracking
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Observability

---

## User Story

As a **developer**,
I want **production crashes and errors to be automatically captured and reported to Sentry**,
So that **I can identify and fix issues affecting real users without relying on user reports**.

---

## Context & Rationale

### Problem Statement

The app currently has development-only logging that is completely silent in production. When the app crashes for real users, there is zero visibility into what happened, where it occurred, or how to reproduce it.

### Current State

- `logError()`, `logWarning()`, `logDebug()` only log in `__DEV__` mode
- Production errors are silently ignored
- No crash reporting service installed
- No way to know if users are experiencing issues

### Desired State

- All production crashes captured automatically
- JS errors include source-mapped stack traces
- Native crashes (iOS/Android) captured
- Existing sensitive data masking applied before sending
- Errors visible in Sentry dashboard within seconds

### Why Now

- Core app features are production-ready
- Need production visibility before wider release
- GDPR-compliant solution (Sentry with EU data residency) identified

---

## Acceptance Criteria

- [ ] Sentry SDK (`@sentry/react-native`) installed and configured
- [ ] Native crash handling enabled for iOS and Android
- [ ] Source maps uploaded for JS error de-minification
- [ ] `logError()` forwards errors to Sentry in production
- [ ] `logWarning()` forwards warnings to Sentry in production
- [ ] `maskSensitiveData()` used in `beforeSend` hook
- [ ] ErrorBoundary explicitly captures errors to Sentry
- [ ] EU data residency configured in Sentry project
- [ ] Development mode (`__DEV__`) disables Sentry completely
- [ ] Test crash works and appears in Sentry dashboard

---

## Story Points & Effort

**Story Points**: 5
**Effort Estimate**: 6 hours
**Actual Effort**: TBD

---

## Tasks

| ID                                                                    | Task                                           | Effort | Status   |
| --------------------------------------------------------------------- | ---------------------------------------------- | ------ | -------- |
| [TASK-372](../tasks/TASK-372-install-configure-sentry-sdk.md)         | Install & Configure Sentry SDK                 | 2h     | 📋 To Do |
| [TASK-373](../tasks/TASK-373-sentry-configuration-module.md)          | Create Sentry Configuration Module             | 1.5h   | 📋 To Do |
| [TASK-374](../tasks/TASK-374-enhance-logger-production-forwarding.md) | Enhance Logger for Production Error Forwarding | 1.5h   | 📋 To Do |
| [TASK-375](../tasks/TASK-375-integrate-sentry-error-boundary.md)      | Integrate Sentry with ErrorBoundary            | 1h     | 📋 To Do |

---

## Technical Notes

### Sentry Configuration

```typescript
Sentry.init({
  dsn: SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__,
  beforeSend: event => {
    // Scrub sensitive data using existing utility
    return maskSentryEvent(event);
  },
});
```

### Logger Enhancement

```typescript
export const logError = (
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void => {
  if (__DEV__) {
    // Existing dev logging (unchanged)
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    console.error(`[DEV] ${message}`, error, maskedContext);
  } else {
    // NEW: Forward to Sentry in production
    Sentry.captureException(error ?? new Error(message), {
      extra: context ? maskSensitiveData(context) : undefined,
    });
  }
};
```

---

## Dependencies

**Blocked By**: None

**Blocks**: US-069, US-070 (depend on SDK installation)

---

**Last Updated**: 2025-12-08
