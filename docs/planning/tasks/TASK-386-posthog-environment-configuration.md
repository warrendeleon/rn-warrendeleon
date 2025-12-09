# TASK-386: PostHog Environment Configuration

**Task ID**: TASK-386
**Title**: PostHog Environment Configuration
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-071: PostHog Analytics Integration](../stories/US-071-posthog-analytics-integration.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Configuration

---

## Overview

Configure environment variables for PostHog across development and production environments. PostHog should be completely disabled in development (no API key) and enabled in production with EU hosting.

---

## Technical Details

### Environment Files

**`.env.development`** (add):

```bash
# PostHog - Disabled in development
POSTHOG_API_KEY=
POSTHOG_HOST=https://eu.posthog.com
```

**`.env.production`** (add):

```bash
# PostHog - Production (EU-hosted for GDPR)
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_HOST=https://eu.posthog.com
```

### TypeScript Types

**`src/types/env.d.ts`** (update):

```typescript
declare module 'react-native-config' {
  export interface NativeConfig {
    // Existing env vars...
    API_BASE_URL: string;

    // Sentry configuration (from TASK-380)
    SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    SENTRY_TRACES_SAMPLE_RATE?: string;

    // PostHog configuration
    POSTHOG_API_KEY?: string;
    POSTHOG_HOST?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
```

---

## Files to Modify

| File                 | Changes                                     |
| -------------------- | ------------------------------------------- |
| `.env.development`   | Add PostHog env vars (disabled)             |
| `.env.production`    | Add PostHog env vars (enabled with API key) |
| `src/types/env.d.ts` | Add PostHog type declarations               |

---

## Acceptance Criteria

- [ ] `.env.development` has PostHog vars with empty API key
- [ ] `.env.production` has PostHog vars with valid API key placeholder
- [ ] `POSTHOG_HOST` set to EU endpoint in both environments
- [ ] TypeScript types updated for new env vars
- [ ] PostHog disabled when `POSTHOG_API_KEY` is empty
- [ ] App builds and runs correctly in both environments
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Development Environment**

```gherkin
Given the app is built with .env.development
When PostHog initialisation is attempted
Then PostHog should be disabled (no API key)
And no events should be sent to PostHog
```

**Scenario 2: Production Environment**

```gherkin
Given the app is built with .env.production
And POSTHOG_API_KEY is set
When PostHog initialisation runs with consent
Then PostHog should be enabled with the API key
And the host should be 'https://eu.posthog.com'
```

**Scenario 3: Missing API Key Handling**

```gherkin
Given the production build has no POSTHOG_API_KEY set
When PostHog initialisation runs
Then PostHog should be disabled gracefully
And no errors should be thrown
```

---

## Dependencies

**Blocked By**: TASK-383 (PostHog SDK installation)

**Blocks**: None

---

## Notes

**Security**:

- `.env.production` should NOT be committed to git (already in `.gitignore`)
- API key is not a secret but should be kept out of public repos
- CI/CD should inject production env vars during build

**EU Data Residency**:
Using `eu.posthog.com` ensures all data is stored in the EU (Frankfurt), which is required for GDPR compliance.

**API Key Format**:
PostHog project API keys start with `phc_` followed by alphanumeric characters.

---

**Last Updated**: 2025-12-09
