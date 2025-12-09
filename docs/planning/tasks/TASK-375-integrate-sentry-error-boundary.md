# TASK-375: Integrate Sentry with ErrorBoundary

**Task ID**: TASK-375
**Title**: Integrate Sentry with ErrorBoundary
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-068: Production Crash & Error Tracking](../stories/US-068-production-crash-error-tracking.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Error Handling

---

## Overview

Enhance the existing ErrorBoundary component to explicitly capture React render errors to Sentry with full component stack traces. While the enhanced `logError()` will forward errors, explicit Sentry capture in ErrorBoundary ensures component stack information is preserved.

---

## Technical Details

### Current Implementation

```typescript
// src/shared/components/ErrorBoundary/ErrorBoundary.tsx (current)
componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  // Log to console in development only (production-safe)
  logError('Error caught by ErrorBoundary', error, { errorInfo });
}
```

### Enhanced Implementation

```typescript
// src/shared/components/ErrorBoundary/ErrorBoundary.tsx (enhanced)
import * as Sentry from '@sentry/react-native';
import { logError } from '@app/utils/logger';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  // Log to console in development / Sentry in production
  logError('Error caught by ErrorBoundary', error, {
    componentStack: errorInfo.componentStack,
  });

  // Explicit Sentry capture to preserve component stack
  if (!__DEV__) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: 'true',
      },
    });
  }
}
```

### Alternative: Use Sentry.ErrorBoundary

Consider wrapping with Sentry's built-in ErrorBoundary:

```typescript
// App.tsx
import * as Sentry from '@sentry/react-native';

const App: React.FC = () => (
  <Sentry.ErrorBoundary fallback={<FallbackUI />}>
    <ErrorBoundary>
      {/* existing app content */}
    </ErrorBoundary>
  </Sentry.ErrorBoundary>
);
```

---

## Files to Modify

| File                                                    | Changes                     |
| ------------------------------------------------------- | --------------------------- |
| `src/shared/components/ErrorBoundary/ErrorBoundary.tsx` | Add explicit Sentry capture |

---

## Acceptance Criteria

- [ ] ErrorBoundary captures errors to Sentry with component stack
- [ ] Component stack preserved in Sentry `contexts.react`
- [ ] Tag `errorBoundary: true` added for filtering
- [ ] Development behaviour unchanged (console logging)
- [ ] Existing `logError()` call remains for consistency
- [ ] No duplicate error reports in Sentry
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Error Capture in Production**

```gherkin
Given the app is running in production mode
And a component throws an error during render
When ErrorBoundary catches the error
Then Sentry.captureException should be called
And the component stack should be included in contexts
And the tag errorBoundary should be 'true'
```

**Scenario 2: Development Mode**

```gherkin
Given the app is running in development mode
And a component throws an error during render
When ErrorBoundary catches the error
Then console.error should be called via logError()
And Sentry.captureException should NOT be called
```

**Scenario 3: FallbackUI Displayed**

```gherkin
Given a component throws an error during render
When ErrorBoundary catches the error
Then FallbackUI should be displayed to the user
And the error should be logged appropriately
```

---

## Dependencies

**Blocked By**: TASK-374 (Enhanced logger with Sentry integration)

**Blocks**: None

---

## Notes

**Why Explicit Capture?**
The enhanced `logError()` already sends to Sentry, but ErrorBoundary has access to `errorInfo.componentStack` which provides the React component hierarchy. Explicit capture ensures this valuable debugging information is preserved.

**Deduplication**:
Sentry automatically deduplicates identical errors, so the double capture (via `logError()` and explicit `captureException()`) won't create duplicate issues.

---

**Last Updated**: 2025-12-08
