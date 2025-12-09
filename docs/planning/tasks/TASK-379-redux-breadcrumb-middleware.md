# TASK-379: Create Redux Breadcrumb Middleware

**Task ID**: TASK-379
**Title**: Create Redux Breadcrumb Middleware
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-070: Observability & Debugging Infrastructure](../stories/US-070-observability-debugging-infrastructure.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Observability

---

## Overview

Create a Redux middleware that logs dispatched actions as Sentry breadcrumbs. When an error occurs, this provides valuable context showing what state changes led to the crash. Failed async thunks are automatically captured as errors.

---

## Technical Details

### Implementation

**`src/store/sentryMiddleware.ts`**:

```typescript
import { Middleware, isRejected, PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';

import { maskSensitiveData } from '@app/utils/logging/maskSensitiveData';

/**
 * Actions to filter from breadcrumbs (too noisy)
 */
const FILTERED_ACTION_PREFIXES = [
  'persist/', // Redux persist actions
  'PERSIST', // Redux persist actions
  'REHYDRATE', // Redux persist rehydration
  '@@redux', // Internal Redux actions
];

/**
 * Actions that may contain sensitive data in payload
 * These get their payloads masked entirely
 */
const SENSITIVE_ACTION_PREFIXES = [
  'auth/', // Authentication actions
  'profile/', // Profile data
  'user/', // User data
];

/**
 * Check if action should be filtered from breadcrumbs
 */
const shouldFilterAction = (actionType: string): boolean => {
  return FILTERED_ACTION_PREFIXES.some(prefix => actionType.startsWith(prefix));
};

/**
 * Check if action payload should be masked entirely
 */
const isSensitiveAction = (actionType: string): boolean => {
  return SENSITIVE_ACTION_PREFIXES.some(prefix => actionType.startsWith(prefix));
};

/**
 * Redux middleware that logs actions as Sentry breadcrumbs
 * - Filters noisy actions (persist, rehydrate)
 * - Masks sensitive action payloads
 * - Captures failed thunks as errors
 */
export const sentryMiddleware: Middleware = () => next => action => {
  // Skip in development
  if (__DEV__) {
    return next(action);
  }

  const typedAction = action as PayloadAction<unknown>;
  const actionType = typedAction.type;

  // Filter noisy actions
  if (shouldFilterAction(actionType)) {
    return next(action);
  }

  // Add breadcrumb for this action
  Sentry.addBreadcrumb({
    category: 'redux',
    message: actionType,
    level: 'info',
    data: isSensitiveAction(actionType)
      ? { payload: '[SENSITIVE_DATA]' }
      : typedAction.payload
        ? { payload: maskSensitiveData(typedAction.payload) }
        : undefined,
  });

  // Capture failed async thunks as errors
  if (isRejected(typedAction)) {
    const error = (typedAction as { error?: { message?: string; stack?: string } }).error;

    Sentry.captureMessage(`Redux thunk failed: ${actionType}`, {
      level: 'error',
      extra: {
        actionType,
        error: error ? maskSensitiveData(error) : undefined,
      },
      tags: {
        reduxThunk: 'rejected',
      },
    });
  }

  return next(action);
};
```

### Integration with Store

**`src/store/configureStore.ts`** (update):

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { sentryMiddleware } from './sentryMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      // Only add Sentry middleware in production
      ...(process.env.NODE_ENV === 'production' ? [sentryMiddleware] : [])
    ),
  // ... other config
});
```

---

## Files to Create

| File                            | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| `src/store/sentryMiddleware.ts` | Redux middleware for Sentry breadcrumbs |

## Files to Modify

| File                          | Changes               |
| ----------------------------- | --------------------- |
| `src/store/configureStore.ts` | Add Sentry middleware |

---

## Acceptance Criteria

- [ ] Redux actions logged as Sentry breadcrumbs
- [ ] Noisy actions filtered (persist, rehydrate, @@redux)
- [ ] Sensitive action payloads masked entirely
- [ ] Other payloads masked using `maskSensitiveData()`
- [ ] Failed async thunks captured as Sentry errors
- [ ] Middleware only active in production
- [ ] Reactotron still works in development
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Action Breadcrumb**

```gherkin
Given the app is running in production mode
When a Redux action 'settings/setLanguage' is dispatched
Then a Sentry breadcrumb should be added
And the breadcrumb category should be 'redux'
And the breadcrumb message should be 'settings/setLanguage'
```

**Scenario 2: Filtered Actions**

```gherkin
Given the app is running in production mode
When a Redux action 'persist/REHYDRATE' is dispatched
Then NO Sentry breadcrumb should be added
```

**Scenario 3: Sensitive Action Masking**

```gherkin
Given the app is running in production mode
When a Redux action 'auth/loginSuccess' is dispatched with user data
Then a Sentry breadcrumb should be added
And the payload should be '[SENSITIVE_DATA]'
```

**Scenario 4: Failed Thunk Capture**

```gherkin
Given the app is running in production mode
When a Redux thunk 'profile/fetchProfile' fails
Then a Sentry error should be captured
And the error should have tag reduxThunk: 'rejected'
And the action type should be included in extras
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373, TASK-374 (SDK, config, and enhanced logger)

**Blocks**: None

---

## Notes

**Action Filtering**:
Redux persist actions are filtered because they fire frequently and don't provide debugging value. The `FILTERED_ACTION_PREFIXES` list can be adjusted based on app-specific needs.

**Payload Masking Strategy**:

- Sensitive actions (auth, profile, user): Payload masked entirely as `[SENSITIVE_DATA]`
- Other actions: Payload passed through `maskSensitiveData()` for targeted masking
- This ensures no PII leaks while preserving debugging context

**Thunk Error Capture**:
Failed async thunks are automatically detected using RTK's `isRejected()` helper. These are captured as Sentry errors, not just breadcrumbs, because they represent actual failures.

---

**Last Updated**: 2025-12-08
