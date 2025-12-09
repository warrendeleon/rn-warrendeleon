# US-071: PostHog Analytics Integration

**Story ID**: US-071
**Title**: PostHog Analytics Integration
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09

---

## User Story

**As a** product owner
**I want** product analytics integrated into the app
**So that** I can understand how users interact with features and make data-driven decisions

---

## Description

Install and configure the PostHog React Native SDK for product analytics. PostHog will track user behaviour, screen views, and feature usage. All analytics are gated behind user consent and disabled in development mode.

---

## Tasks

| Task ID                                                            | Title                               | Status   | Priority |
| ------------------------------------------------------------------ | ----------------------------------- | -------- | -------- |
| [TASK-383](../tasks/TASK-383-install-posthog-sdk.md)               | Install PostHog SDK                 | 📋 To Do | High     |
| [TASK-384](../tasks/TASK-384-posthog-configuration-module.md)      | Create PostHog Configuration Module | 📋 To Do | High     |
| [TASK-385](../tasks/TASK-385-analytics-utility-layer.md)           | Create Analytics Utility Layer      | 📋 To Do | High     |
| [TASK-386](../tasks/TASK-386-posthog-environment-configuration.md) | PostHog Environment Configuration   | 📋 To Do | High     |
| [TASK-387](../tasks/TASK-387-rntl-tests-analytics-utility.md)      | RNTL Tests for Analytics Utility    | 📋 To Do | High     |

---

## Acceptance Criteria

- [ ] PostHog SDK installed via `yarn add posthog-react-native`
- [ ] PostHog configured with EU hosting (`eu.posthog.com`)
- [ ] Analytics utility layer provides `trackEvent()`, `trackScreen()`, `identifyUser()`
- [ ] All tracked data passes through `maskSensitiveData()` before sending
- [ ] Analytics completely disabled in `__DEV__` mode
- [ ] Analytics only enabled when user consent is granted
- [ ] Environment variables configured for dev (disabled) and prod (enabled)
- [ ] TypeScript types updated for PostHog env vars
- [ ] Unit tests achieve 100% coverage on analytics utility
- [ ] `yarn validate` passes with 0 errors

---

## Technical Notes

**PostHog Configuration**:

```typescript
// EU hosting for GDPR compliance
host: 'https://eu.posthog.com'

// Privacy settings
autocapture: {
  captureScreenViews: true,
  captureTouches: false,  // Disable for privacy
}
```

**Consent Gate**:

```typescript
if (__DEV__ || !consentGranted || !Config.POSTHOG_API_KEY) {
  return; // Don't initialise
}
```

---

## Out of Scope

- Consent UI (covered in US-073)
- Consent storage (covered in US-072)
- Sentry integration (covered in EPIC-032)

---

**Last Updated**: 2025-12-09
