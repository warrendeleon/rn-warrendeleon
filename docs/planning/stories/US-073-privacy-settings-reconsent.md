# US-073: Privacy Settings & Re-consent Flow

**Story ID**: US-073
**Title**: Privacy Settings & Re-consent Flow
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09

---

## User Story

**As a** first-time user
**I want** to see what data the app collects before using it
**So that** I can make an informed decision about my privacy

**As a** returning user
**I want** to easily change my privacy preferences
**So that** I remain in control of my data

**As a** user affected by T&C/Privacy changes
**I want** to be notified and asked to re-accept
**So that** I understand any changes to how my data is handled

---

## Description

Implement the user-facing consent UI including the initial consent screen (shown on first launch), the re-consent flow (triggered when legal documents change), and the Privacy Settings section in the Settings screen.

---

## Tasks

| Task ID                                                        | Title                           | Status   | Priority |
| -------------------------------------------------------------- | ------------------------------- | -------- | -------- |
| [TASK-393](../tasks/TASK-393-consent-screen-ui.md)             | ConsentScreen UI Component      | 📋 To Do | Critical |
| [TASK-394](../tasks/TASK-394-onboarding-consent-navigation.md) | Onboarding Consent Navigation   | 📋 To Do | Critical |
| [TASK-395](../tasks/TASK-395-privacy-settings-section.md)      | Privacy Settings Section        | 📋 To Do | High     |
| [TASK-396](../tasks/TASK-396-rntl-tests-consent-features.md)   | RNTL Tests for Consent Features | 📋 To Do | High     |
| [TASK-397](../tasks/TASK-397-e2e-tests-consent-flow.md)        | E2E Tests for Consent Flow      | 📋 To Do | High     |

---

## Acceptance Criteria

### ConsentScreen

- [ ] Screen displays on first app launch (before any data collection)
- [ ] Screen displays when T&C or Privacy Policy version changes
- [ ] "Analytics & Diagnostics" toggle defaults to OFF
- [ ] T&C and Privacy Policy links navigate to respective screens
- [ ] Checkbox for "I have read and accept the Terms and Privacy Policy"
- [ ] Continue button disabled until terms accepted
- [ ] All elements have EAA-compliant accessibility props
- [ ] i18n translations for all 5 languages

### Navigation Integration

- [ ] ConsentScreen blocks access to main app until terms accepted
- [ ] Re-consent flow shows updated messaging ("We've updated our...")
- [ ] After consent, user proceeds to Home screen

### Privacy Settings

- [ ] "Privacy" section added to SettingsScreen
- [ ] Analytics toggle immediately enables/disables Sentry + PostHog
- [ ] Links to T&C and Privacy Policy screens
- [ ] Toggle state synced with Redux and EncryptedStore

### Testing

- [ ] RNTL tests for ConsentScreen (default state, interactions, validation)
- [ ] RNTL tests for Privacy Settings section
- [ ] E2E tests for first launch consent flow
- [ ] E2E tests for consent revocation in settings
- [ ] `yarn validate` passes with 0 errors

---

## Screen Wireframe

```
┌────────────────────────────────────────┐
│  🔒 Your Privacy Matters               │
│                                        │
│  We use analytics and crash reporting  │
│  to improve the app. No personal data  │
│  is sold or shared with advertisers.   │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  📊 Analytics & Diagnostics      │  │
│  │  [Toggle: OFF by default]        │  │
│  │                                  │  │
│  │  Helps us fix crashes and        │  │
│  │  understand how you use the app  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  📄 Terms & Conditions [Link]          │
│  🔐 Privacy Policy [Link]              │
│                                        │
│  ☑️ I have read and accept the         │
│     Terms and Privacy Policy           │
│                                        │
│  [Continue Button]                     │
└────────────────────────────────────────┘
```

---

## Re-consent Trigger

When `checkNeedsReConsent()` returns `true` (version mismatch detected):

1. App sets `needsReConsent: true` in Redux
2. Navigation shows ConsentScreen instead of main app
3. Screen header changes to "We've Updated Our Policies"
4. Previous analytics preference is pre-filled
5. User must re-accept terms to continue

---

## Out of Scope

- Analytics SDK (covered in US-071)
- Consent storage/sync (covered in US-072)
- Sentry integration (covered in EPIC-032)

---

**Last Updated**: 2025-12-09
