# TASK-374: Enhance Logger for Production Error Forwarding

**Task ID**: TASK-374
**Title**: Enhance Logger for Production Error Forwarding
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-068: Production Crash & Error Tracking](../stories/US-068-production-crash-error-tracking.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Logging

---

## Overview

Enhance the existing `logger.ts` utility to forward errors and warnings to Sentry in production mode while maintaining the current development-only console logging behaviour. Add new logging functions for breadcrumbs and informational messages.

---

## Technical Details

### Current Implementation

```typescript
// src/utils/logger.ts (current)
export const logError = (
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void => {
  if (__DEV__) {
    const maskedContext = context ? maskSensitiveData(context) : undefined;
    const maskedError = error ? maskSensitiveData(error) : undefined;
    console.error(`[DEV] ${message}`, maskedError, maskedContext);
  }
  // In production: error is silently ignored
  // TODO: Integrate Sentry/Crashlytics for production error tracking
};
```

### Enhanced Implementation

```typescript
// src/utils/logger.ts (enhanced)
import * as Sentry from '@sentry/react-native';
import { maskSensitiveData } from './logging/maskSensitiveData';

export const logError = (
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void => {
  const maskedContext = context ? maskSensitiveData(context) : undefined;

  if (__DEV__) {
    const maskedError = error ? maskSensitiveData(error) : undefined;
    console.error(`[DEV] ${message}`, maskedError, maskedContext);
  } else {
    // Production: send to Sentry
    Sentry.captureException(error instanceof Error ? error : new Error(message), {
      extra: {
        message,
        ...maskedContext,
      },
    });
  }
};

export const logWarning = (message: string, context?: Record<string, unknown>): void => {
  const maskedContext = context ? maskSensitiveData(context) : undefined;

  if (__DEV__) {
    console.warn(`[DEV] ${message}`, maskedContext);
  } else {
    // Production: send to Sentry as warning
    Sentry.captureMessage(message, {
      level: 'warning',
      extra: maskedContext,
    });
  }
};

export const logDebug = (message: string, data?: unknown): void => {
  if (__DEV__) {
    const maskedData = data !== undefined ? maskSensitiveData(data) : undefined;
    console.log(`[DEV] ${message}`, maskedData);
  }
  // Debug logs are never sent to Sentry (too noisy)
};

// NEW: Log informational breadcrumb
export const logInfo = (message: string, data?: Record<string, unknown>): void => {
  if (__DEV__) {
    const maskedData = data ? maskSensitiveData(data) : undefined;
    console.info(`[DEV] ${message}`, maskedData);
  } else {
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      level: 'info',
      data: data ? (maskSensitiveData(data) as Record<string, unknown>) : undefined,
    });
  }
};

// NEW: Log custom breadcrumb
export const logBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info'
): void => {
  if (__DEV__) {
    const maskedData = data ? maskSensitiveData(data) : undefined;
    console.log(`[DEV][${category}] ${message}`, maskedData);
  } else {
    Sentry.addBreadcrumb({
      category,
      message,
      level,
      data: data ? (maskSensitiveData(data) as Record<string, unknown>) : undefined,
    });
  }
};
```

---

## Files to Modify

| File                  | Changes                              |
| --------------------- | ------------------------------------ |
| `src/utils/logger.ts` | Add Sentry forwarding, new functions |

---

## Acceptance Criteria

- [ ] `logError()` forwards to `Sentry.captureException()` in production
- [ ] `logWarning()` forwards to `Sentry.captureMessage()` with warning level
- [ ] `logDebug()` remains dev-only (no Sentry forwarding)
- [ ] New `logInfo()` function adds breadcrumbs in production
- [ ] New `logBreadcrumb()` function for custom breadcrumbs
- [ ] All logged data passes through `maskSensitiveData()`
- [ ] Development behaviour unchanged (console logging)
- [ ] TODO comment removed from logger.ts
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: logError in Production**

```gherkin
Given the app is running in production mode
When logError('Payment failed', new Error('Network error'), { userId: '123' }) is called
Then Sentry.captureException should be called
And the error message should be 'Payment failed'
And the context should be masked and included
```

**Scenario 2: logWarning in Production**

```gherkin
Given the app is running in production mode
When logWarning('Low battery', { level: 10 }) is called
Then Sentry.captureMessage should be called with level 'warning'
```

**Scenario 3: logDebug Never Sends to Sentry**

```gherkin
Given the app is running in production mode
When logDebug('Debug info', { data: 'test' }) is called
Then Sentry.captureMessage should NOT be called
And Sentry.addBreadcrumb should NOT be called
```

**Scenario 4: Sensitive Data Masking**

```gherkin
Given the app is running in production mode
When logError('Auth failed', error, { email: 'user@test.com', password: 'secret' }) is called
Then the email should be masked as '[MASKED_EMAIL]'
And the password should be masked as '[MASKED]'
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373 (Sentry SDK and configuration)

**Blocks**: TASK-375, TASK-381

---

## Notes

**Backwards Compatibility**:
All existing `logError()`, `logWarning()`, `logDebug()` calls continue to work without changes. The enhancement is transparent to existing code.

**Severity Levels**:

- `logError()` → Sentry error (appears in Issues)
- `logWarning()` → Sentry warning (appears in Issues)
- `logInfo()` → Sentry breadcrumb (context only)
- `logBreadcrumb()` → Custom breadcrumb (context only)

---

**Last Updated**: 2025-12-08
