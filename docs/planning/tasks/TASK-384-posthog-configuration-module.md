# TASK-384: Create PostHog Configuration Module

**Task ID**: TASK-384
**Title**: Create PostHog Configuration Module
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-071: PostHog Analytics Integration](../stories/US-071-posthog-analytics-integration.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Infrastructure

---

## Overview

Create the PostHog configuration module that handles SDK initialisation, consent gating, and shutdown. PostHog should only be active when the user has granted consent and the app is in production mode.

---

## Technical Details

### Implementation

**`src/config/posthog.ts`**:

```typescript
import PostHog from 'posthog-react-native';
import Config from 'react-native-config';

let posthogClient: PostHog | null = null;

/**
 * Initialise PostHog analytics
 * Only active in production when user has granted consent
 */
export const initPostHog = async (consentGranted: boolean): Promise<void> => {
  // Guard: Don't initialise in dev, without consent, or without API key
  if (__DEV__ || !consentGranted || !Config.POSTHOG_API_KEY) {
    return;
  }

  posthogClient = await PostHog.initAsync(Config.POSTHOG_API_KEY, {
    host: Config.POSTHOG_HOST || 'https://eu.posthog.com',
    captureApplicationLifecycleEvents: true,
    captureDeepLinks: true,
    recordScreenViews: true,
    autocapture: {
      captureScreenViews: true,
      captureTouches: false, // Disabled for privacy
    },
  });
};

/**
 * Get the PostHog client instance
 * Returns null if not initialised
 */
export const getPostHog = (): PostHog | null => posthogClient;

/**
 * Shutdown PostHog when consent is revoked
 */
export const shutdownPostHog = async (): Promise<void> => {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
};

/**
 * Check if PostHog is currently active
 */
export const isPostHogActive = (): boolean => posthogClient !== null;
```

---

## Files to Create

| File                    | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `src/config/posthog.ts` | PostHog initialisation and configuration |

---

## Acceptance Criteria

- [ ] `src/config/posthog.ts` created with all functions
- [ ] `initPostHog()` accepts consent boolean and only initialises if true
- [ ] `initPostHog()` returns early in `__DEV__` mode
- [ ] `initPostHog()` returns early if `POSTHOG_API_KEY` is empty
- [ ] `getPostHog()` returns client or null
- [ ] `shutdownPostHog()` properly shuts down and clears client reference
- [ ] `isPostHogActive()` returns correct boolean state
- [ ] PostHog configured for EU hosting by default
- [ ] Touch capture disabled for privacy
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Consent Required**

```gherkin
Given the app is in production mode
When initPostHog() is called with consentGranted=false
Then PostHog should NOT be initialised
And getPostHog() should return null
```

**Scenario 2: Development Mode Guard**

```gherkin
Given the app is in development mode (__DEV__ = true)
When initPostHog() is called with consentGranted=true
Then PostHog should NOT be initialised
And getPostHog() should return null
```

**Scenario 3: Production with Consent**

```gherkin
Given the app is in production mode
And POSTHOG_API_KEY is set
When initPostHog() is called with consentGranted=true
Then PostHog should be initialised
And getPostHog() should return the client instance
```

**Scenario 4: Consent Revocation**

```gherkin
Given PostHog is initialised
When shutdownPostHog() is called
Then PostHog should be shut down
And getPostHog() should return null
```

---

## Dependencies

**Blocked By**: TASK-383 (PostHog SDK installation)

**Blocks**: TASK-385 (Analytics utility layer)

---

## Notes

**Configuration Options**:

- `captureApplicationLifecycleEvents`: Auto-capture app open/close
- `captureDeepLinks`: Track deep link navigation
- `recordScreenViews`: Auto-capture screen changes
- `captureTouches: false`: Disabled to prevent capturing sensitive touch areas

**Privacy Considerations**:
Touch heatmaps are disabled (`captureTouches: false`) to prevent inadvertently capturing touches on sensitive fields like password inputs.

---

**Last Updated**: 2025-12-09
