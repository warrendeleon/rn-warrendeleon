# TASK-376: Add Navigation Breadcrumbs

**Task ID**: TASK-376
**Title**: Add Navigation Breadcrumbs
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-069: Application Performance Monitoring](../stories/US-069-application-performance-monitoring.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Observability

---

## Overview

Add navigation breadcrumbs to Sentry so that when an error occurs, the user's screen navigation history is visible. This helps debug issues by showing what screens the user visited before the crash.

---

## Technical Details

### Implementation

**`src/navigation/sentryNavigationIntegration.ts`**:

```typescript
import * as Sentry from '@sentry/react-native';
import { NavigationContainerRef } from '@react-navigation/native';

/**
 * Create Sentry routing instrumentation for React Navigation
 * Tracks screen changes as breadcrumbs and performance transactions
 */
export const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

/**
 * Register navigation container with Sentry
 * Call this in NavigationContainer's onReady prop
 */
export const registerNavigationContainer = (
  navigationRef: React.RefObject<NavigationContainerRef<ReactNavigation.RootParamList>>
): void => {
  if (navigationRef.current) {
    routingInstrumentation.registerNavigationContainer(navigationRef);
  }
};

/**
 * Log navigation state change as breadcrumb
 * For manual breadcrumb logging if needed
 */
export const logNavigationChange = (
  previousRouteName: string | undefined,
  currentRouteName: string | undefined
): void => {
  if (!__DEV__ && currentRouteName) {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${currentRouteName}`,
      level: 'info',
      data: {
        from: previousRouteName,
        to: currentRouteName,
      },
    });
  }
};
```

### Update Sentry Configuration

**`src/config/sentry.ts`** (add integration):

```typescript
import { routingInstrumentation } from '@app/navigation/sentryNavigationIntegration';

Sentry.init({
  // ... existing config
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
      tracingOrigins: ['localhost', /^\//],
    }),
  ],
});
```

### Update Navigation Container

**`src/navigation/RootNavigator/RootNavigator.tsx`** (or AppNavigator):

```typescript
import { useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { registerNavigationContainer } from '@app/navigation/sentryNavigationIntegration';

export const RootNavigator: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => registerNavigationContainer(navigationRef)}
    >
      {/* ... stack navigators */}
    </NavigationContainer>
  );
};
```

---

## Files to Create

| File                                            | Purpose                          |
| ----------------------------------------------- | -------------------------------- |
| `src/navigation/sentryNavigationIntegration.ts` | Navigation instrumentation setup |

## Files to Modify

| File                                             | Changes                            |
| ------------------------------------------------ | ---------------------------------- |
| `src/config/sentry.ts`                           | Add ReactNativeTracing integration |
| `src/navigation/RootNavigator/RootNavigator.tsx` | Register navigation container      |

---

## Acceptance Criteria

- [ ] Navigation changes logged as Sentry breadcrumbs
- [ ] Breadcrumbs show "from" and "to" screen names
- [ ] ReactNativeTracing integration configured
- [ ] Navigation container registered with Sentry on ready
- [ ] Screen load performance tracked (transaction per screen)
- [ ] No breadcrumbs in development mode
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Navigation Breadcrumb Logged**

```gherkin
Given the app is running in production mode
When the user navigates from Home to Settings
Then a breadcrumb should be added to Sentry
And the breadcrumb category should be 'navigation'
And the data should include { from: 'Home', to: 'Settings' }
```

**Scenario 2: Screen Performance Transaction**

```gherkin
Given the app is running in production mode
And performance monitoring is enabled
When the user navigates to a new screen
Then a performance transaction should be created
And the transaction name should be the screen name
```

**Scenario 3: Error with Navigation Context**

```gherkin
Given the user has navigated through Home → Settings → Profile
When an error occurs on the Profile screen
Then the Sentry error should include navigation breadcrumbs
And the breadcrumbs should show the navigation path
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373 (Sentry SDK and configuration)

**Blocks**: None

---

## Notes

**React Navigation Integration**:
Sentry provides first-class integration with React Navigation. The `ReactNavigationInstrumentation` automatically captures:

- Screen name changes
- Screen load times
- Navigation timing

**Breadcrumb Limit**:
Sentry keeps the last 100 breadcrumbs by default. Navigation breadcrumbs are included in this count.

---

**Last Updated**: 2025-12-08
