# TASK-385: Create Analytics Utility Layer

**Task ID**: TASK-385
**Title**: Create Analytics Utility Layer
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-071: PostHog Analytics Integration](../stories/US-071-posthog-analytics-integration.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Utility

---

## Overview

Create an analytics abstraction layer that wraps PostHog. This provides a consistent API for tracking events throughout the app, handles development mode logging, and ensures all data is masked for sensitive information before sending.

---

## Technical Details

### Implementation

**`src/utils/analytics.ts`**:

```typescript
import { getPostHog } from '@app/config/posthog';
import { maskSensitiveData } from '@app/utils/logging/maskSensitiveData';

/**
 * Track a custom event
 * In dev: logs to console
 * In prod: sends to PostHog (if initialised)
 */
export const trackEvent = (eventName: string, properties?: Record<string, unknown>): void => {
  if (__DEV__) {
    console.log('[Analytics]', eventName, properties);
    return;
  }

  const posthog = getPostHog();
  if (posthog) {
    posthog.capture(eventName, properties ? maskSensitiveData(properties) : undefined);
  }
};

/**
 * Track a screen view
 */
export const trackScreen = (screenName: string, properties?: Record<string, unknown>): void => {
  trackEvent('$screen', {
    $screen_name: screenName,
    ...properties,
  });
};

/**
 * Identify a user (call after login)
 */
export const identifyUser = (userId: string, traits?: Record<string, unknown>): void => {
  if (__DEV__) {
    console.log('[Analytics] Identify:', userId, traits);
    return;
  }

  const posthog = getPostHog();
  if (posthog) {
    posthog.identify(userId, traits ? maskSensitiveData(traits) : undefined);
  }
};

/**
 * Reset analytics (call on logout)
 */
export const resetAnalytics = (): void => {
  if (__DEV__) {
    console.log('[Analytics] Reset');
    return;
  }

  const posthog = getPostHog();
  if (posthog) {
    posthog.reset();
  }
};

/**
 * Set user properties without identifying
 */
export const setUserProperties = (properties: Record<string, unknown>): void => {
  if (__DEV__) {
    console.log('[Analytics] Set properties:', properties);
    return;
  }

  const posthog = getPostHog();
  if (posthog) {
    posthog.capture('$set', {
      $set: maskSensitiveData(properties),
    });
  }
};
```

---

## Files to Create

| File                     | Purpose                     |
| ------------------------ | --------------------------- |
| `src/utils/analytics.ts` | Analytics abstraction layer |

---

## Acceptance Criteria

- [ ] `src/utils/analytics.ts` created with all functions
- [ ] `trackEvent()` logs to console in dev, sends to PostHog in prod
- [ ] `trackScreen()` correctly formats screen view events
- [ ] `identifyUser()` properly identifies users after login
- [ ] `resetAnalytics()` clears user identity on logout
- [ ] `setUserProperties()` sets properties without re-identifying
- [ ] All properties pass through `maskSensitiveData()` before sending
- [ ] All functions handle null PostHog client gracefully
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Development Mode Logging**

```gherkin
Given the app is in development mode
When trackEvent('button_click', { button: 'submit' }) is called
Then the event should be logged to console
And PostHog should NOT be called
```

**Scenario 2: Production Event Tracking**

```gherkin
Given the app is in production mode
And PostHog is initialised
When trackEvent('button_click', { button: 'submit' }) is called
Then PostHog.capture should be called with the event
And the properties should be passed through maskSensitiveData
```

**Scenario 3: Sensitive Data Masking**

```gherkin
Given the app is in production mode
And PostHog is initialised
When trackEvent('form_submit', { email: 'user@test.com' }) is called
Then the email should be masked before sending to PostHog
```

**Scenario 4: Null Client Handling**

```gherkin
Given the app is in production mode
And PostHog is NOT initialised (consent denied)
When trackEvent('button_click') is called
Then no error should be thrown
And no event should be sent
```

---

## Dependencies

**Blocked By**: TASK-384 (PostHog configuration module)

**Blocks**: TASK-387 (RNTL tests for analytics)

---

## Notes

**Event Naming Conventions**:

- Use snake_case for event names: `button_click`, `form_submit`, `screen_view`
- Use `$` prefix for PostHog standard events: `$screen`, `$set`
- Include context in properties: `{ screen: 'HomeScreen', button: 'contact' }`

**Usage Example**:

```typescript
// In a screen component
import { trackScreen, trackEvent } from '@app/utils/analytics';

// Track screen view
useEffect(() => {
  trackScreen('HomeScreen');
}, []);

// Track button press
const handlePress = () => {
  trackEvent('contact_button_pressed', { method: 'email' });
  // ... navigation
};
```

---

**Last Updated**: 2025-12-09
