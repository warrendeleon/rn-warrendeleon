# TASK-378: Enable Performance Monitoring

**Task ID**: TASK-378
**Title**: Enable Performance Monitoring
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-069: Application Performance Monitoring](../stories/US-069-application-performance-monitoring.md)
**Status**: 📋 To Do
**Priority**: Medium
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Performance

---

## Overview

Enable Sentry Performance Monitoring to track app start times, screen load durations, and create custom performance spans. Configure appropriate sampling rates to balance insight with cost.

---

## Technical Details

### Update Sentry Configuration

**`src/config/sentry.ts`** (update):

```typescript
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { routingInstrumentation } from '@app/navigation/sentryNavigationIntegration';

export const initialiseSentry = (): void => {
  if (__DEV__) return;

  Sentry.init({
    dsn: Config.SENTRY_DSN,
    environment: Config.SENTRY_ENVIRONMENT || 'production',

    // Performance monitoring
    tracesSampleRate: parseFloat(Config.SENTRY_TRACES_SAMPLE_RATE || '0.2'),

    // Enable auto-instrumentation
    enableAutoPerformanceTracing: true,

    // React Native Tracing integration
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation,
        tracingOrigins: ['localhost', /^\//],

        // Track app start time
        enableAppStartTracking: true,

        // Track native frames (iOS only)
        enableNativeFramesTracking: true,

        // Track stalls (main thread blocking)
        enableStallTracking: true,

        // Slow transaction threshold (ms)
        finalTimeoutMs: 60000,
      }),
    ],

    // Performance sampling
    profilesSampleRate: 0.1, // 10% of transactions get profiled

    // ... other config
  });
};
```

### Custom Performance Utility

**`src/utils/logging/performanceTracing.ts`**:

```typescript
import * as Sentry from '@sentry/react-native';

/**
 * Start a custom performance span
 * Use for measuring specific operations
 *
 * @example
 * const span = startPerformanceSpan('fetchUserData');
 * await fetchData();
 * endPerformanceSpan(span);
 */
export const startPerformanceSpan = (
  name: string,
  op: string = 'task'
): Sentry.Span | undefined => {
  if (__DEV__) return undefined;

  const transaction = Sentry.getActiveTransaction();
  if (!transaction) return undefined;

  return transaction.startChild({
    op,
    description: name,
  });
};

/**
 * End a custom performance span
 */
export const endPerformanceSpan = (span: Sentry.Span | undefined): void => {
  if (span) {
    span.finish();
  }
};

/**
 * Measure an async operation
 *
 * @example
 * const data = await measureAsync('fetchProfile', async () => {
 *   return await api.getProfile();
 * });
 */
export const measureAsync = async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
  const span = startPerformanceSpan(name);
  try {
    return await operation();
  } finally {
    endPerformanceSpan(span);
  }
};
```

---

## Files to Create

| File                                      | Purpose                           |
| ----------------------------------------- | --------------------------------- |
| `src/utils/logging/performanceTracing.ts` | Custom performance span utilities |

## Files to Modify

| File                   | Changes                       |
| ---------------------- | ----------------------------- |
| `src/config/sentry.ts` | Enable performance monitoring |

---

## Acceptance Criteria

- [ ] `tracesSampleRate` set to 0.2 (20% of transactions)
- [ ] `enableAutoPerformanceTracing` enabled
- [ ] App start tracking enabled
- [ ] Native frames tracking enabled (iOS)
- [ ] Stall tracking enabled
- [ ] `startPerformanceSpan()` utility available
- [ ] `measureAsync()` utility available
- [ ] Performance data visible in Sentry Performance dashboard
- [ ] Development mode disables performance tracking
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: App Start Performance**

```gherkin
Given the app is running in production mode
When the app starts (cold start)
Then Sentry should capture app start duration
And the metric should appear in Performance dashboard
```

**Scenario 2: Screen Load Performance**

```gherkin
Given the app is running in production mode
When the user navigates to a new screen
Then Sentry should capture screen load duration
And the transaction should be named after the screen
```

**Scenario 3: Custom Performance Span**

```gherkin
Given the app is running in production mode
When measureAsync('fetchProfile', fetchProfile) is called
Then a child span should be created
And the span duration should be recorded
```

**Scenario 4: Sampling Rate**

```gherkin
Given tracesSampleRate is set to 0.2
When 100 transactions occur
Then approximately 20 transactions should be sent to Sentry
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373, TASK-376 (SDK, config, and navigation instrumentation)

**Blocks**: None

---

## Notes

**Sampling Rate Considerations**:

- 20% is a good starting point for mobile apps
- Higher rates provide more data but increase costs
- Can be adjusted based on traffic and budget

**Profiling**:
`profilesSampleRate: 0.1` means 10% of sampled transactions get detailed CPU profiling. This is useful for identifying performance bottlenecks but has higher overhead.

**Custom Spans**:
The `measureAsync()` utility is useful for measuring specific operations like API calls, data processing, or heavy computations that aren't automatically instrumented.

---

**Last Updated**: 2025-12-08
