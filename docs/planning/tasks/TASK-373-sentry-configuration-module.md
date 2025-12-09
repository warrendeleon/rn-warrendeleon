# TASK-373: Create Sentry Configuration Module

**Task ID**: TASK-373
**Title**: Create Sentry Configuration Module
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-068: Production Crash & Error Tracking](../stories/US-068-production-crash-error-tracking.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Infrastructure

---

## Overview

Create a centralised Sentry configuration module that initialises the SDK with proper settings including EU data residency, sampling rates, and integration with the existing `maskSensitiveData` utility for GDPR-compliant data scrubbing.

**Important**: Sentry must only be initialised AFTER user consent is granted. This module provides `initSentry(consentGranted)` which is called from the consent flow, NOT on app startup.

---

## Technical Details

### Files to Create

**`src/config/sentry.ts`**:

```typescript
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

import { maskSensitiveData } from '@app/utils/logging/maskSensitiveData';

/**
 * Mask sensitive data in Sentry events before sending
 * Uses existing maskSensitiveData utility for GDPR compliance
 */
const maskSentryEvent = (event: Sentry.Event): Sentry.Event => {
  // Mask extra data
  if (event.extra) {
    event.extra = maskSensitiveData(event.extra) as Record<string, unknown>;
  }

  // Mask breadcrumb data
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
      ...breadcrumb,
      data: breadcrumb.data ? maskSensitiveData(breadcrumb.data) : undefined,
    }));
  }

  // Mask user data
  if (event.user) {
    event.user = {
      ...event.user,
      email: event.user.email ? '[MASKED_EMAIL]' : undefined,
    };
  }

  return event;
};

let isSentryInitialised = false;

/**
 * Initialise Sentry SDK
 * Only call AFTER user has granted analytics consent (GDPR/CCPA compliance)
 * @param consentGranted - Whether user has consented to analytics
 */
export const initSentry = async (consentGranted: boolean): Promise<void> => {
  // Never initialise in development
  if (__DEV__) {
    return;
  }

  // Don't initialise without consent
  if (!consentGranted) {
    return;
  }

  // Prevent double initialisation
  if (isSentryInitialised) {
    return;
  }

  const dsn = Config.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: Config.SENTRY_ENVIRONMENT || 'production',

    // Performance monitoring
    tracesSampleRate: parseFloat(Config.SENTRY_TRACES_SAMPLE_RATE || '0.2'),

    // GDPR compliance: scrub sensitive data before sending
    beforeSend: event => maskSentryEvent(event),

    // Enable native crash handling
    enableNativeCrashHandling: true,
    enableNativeNagger: false,

    // Attach screenshots on crash (optional)
    attachScreenshot: true,

    // Debug mode (disable in production)
    debug: false,
  });

  isSentryInitialised = true;
};

/**
 * Shutdown Sentry when user revokes consent
 * Note: Sentry doesn't have a clean shutdown API, so we just stop sending
 */
export const shutdownSentry = (): void => {
  if (__DEV__ || !isSentryInitialised) {
    return;
  }

  // Close Sentry client to stop sending events
  Sentry.close();
  isSentryInitialised = false;
};

/**
 * Set user context for Sentry (call after authentication)
 * Only sets user ID - no PII sent to Sentry
 */
export const setSentryUser = (userId: string | null): void => {
  if (__DEV__) return;

  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add custom tag for filtering in Sentry dashboard
 */
export const setSentryTag = (key: string, value: string): void => {
  if (__DEV__) return;
  Sentry.setTag(key, value);
};

export { Sentry };
```

### Usage (Called from Consent Flow)

**Note**: Do NOT call `initSentry()` in App.tsx. It's called from the consent system:

**`src/features/Consent/ConsentScreen.tsx`** (from TASK-393):

```typescript
import { initSentry } from '@app/config/sentry';
import { initPostHog } from '@app/config/posthog';

const handleContinue = async () => {
  // Save consent to storage
  await saveConsentToStorage({ analyticsEnabled, termsVersionAccepted: CURRENT_TERMS_VERSION });

  // Initialise analytics services if consent granted
  if (analyticsEnabled) {
    await initSentry(true);
    await initPostHog(true);
  }

  // Navigate to main app
  navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
};
```

**`src/features/Settings/SettingsScreen.tsx`** (from TASK-395):

```typescript
import { initSentry, shutdownSentry } from '@app/config/sentry';
import { initPostHog, shutdownPostHog } from '@app/config/posthog';

const handleAnalyticsToggle = async (enabled: boolean) => {
  dispatch(setAnalyticsEnabled(enabled));

  if (enabled) {
    await initSentry(true);
    await initPostHog(true);
  } else {
    shutdownSentry();
    await shutdownPostHog();
  }
};
```

---

## Files to Create

| File                   | Purpose                          |
| ---------------------- | -------------------------------- |
| `src/config/sentry.ts` | Centralised Sentry configuration |

## Files to Modify

| File                  | Changes              |
| --------------------- | -------------------- |
| `src/config/index.ts` | Export sentry config |

**Note**: App.tsx does NOT call `initSentry()`. Initialisation happens in the consent flow (TASK-393, TASK-394).

---

## Acceptance Criteria

- [ ] `src/config/sentry.ts` created with Sentry initialisation
- [ ] `initSentry(consentGranted: boolean)` accepts consent parameter
- [ ] `shutdownSentry()` function implemented for consent revocation
- [ ] `maskSentryEvent()` uses existing `maskSensitiveData()` utility
- [ ] Sentry disabled in `__DEV__` mode
- [ ] DSN loaded from environment variables
- [ ] `beforeSend` hook masks sensitive data
- [ ] Sentry NOT initialised on app startup (only via consent flow)
- [ ] `setSentryUser()` available for auth integration
- [ ] `setSentryTag()` available for custom filtering
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Development Mode**

```gherkin
Given the app is running in development mode (__DEV__ = true)
When initSentry(true) is called
Then Sentry.init() should NOT be called
And no errors should be sent to Sentry
```

**Scenario 2: Production Mode with Consent**

```gherkin
Given the app is running in production mode (__DEV__ = false)
And SENTRY_DSN is configured
When initSentry(true) is called
Then Sentry.init() should be called with correct configuration
And beforeSend hook should mask sensitive data
```

**Scenario 3: Production Mode without Consent**

```gherkin
Given the app is running in production mode
And SENTRY_DSN is configured
When initSentry(false) is called
Then Sentry.init() should NOT be called
And no errors should be sent to Sentry
```

**Scenario 4: Consent Revocation**

```gherkin
Given Sentry has been initialised with consent
When shutdownSentry() is called
Then Sentry.close() should be called
And no further errors should be sent to Sentry
```

**Scenario 5: Missing DSN**

```gherkin
Given the app is running in production mode
And SENTRY_DSN is not configured
When initSentry(true) is called
Then a warning should be logged
And Sentry.init() should NOT be called
```

---

## Dependencies

**Blocked By**: TASK-372 (Sentry SDK must be installed)

**Blocks**: TASK-374, TASK-375, TASK-376, TASK-377, TASK-378, TASK-379

**Related (EPIC-033)**: TASK-393 (ConsentScreen), TASK-394 (Onboarding Navigation), TASK-395 (Privacy Settings) - these call `initSentry()` and `shutdownSentry()`

---

## Notes

**Consent Integration**:
This module is designed to work with EPIC-033 (Product Analytics & Consent Management). Sentry is NEVER initialised automatically on app startup. Instead:

1. On first launch: `initSentry()` called after user accepts consent in ConsentScreen
2. On returning launch: `initSentry()` called if stored consent is still valid
3. On settings toggle: `initSentry()` or `shutdownSentry()` called based on toggle state

**EU Data Residency**:
The DSN determines which region data is sent to. Use a DSN from an EU-hosted Sentry project for GDPR compliance.

**Sampling Rates**:

- `tracesSampleRate: 0.2` means 20% of transactions are sampled for performance monitoring
- Error capture is always 100% (all errors are captured)

---

**Last Updated**: 2025-12-09
