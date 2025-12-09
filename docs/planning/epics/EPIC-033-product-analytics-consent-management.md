# EPIC-033: Product Analytics & Consent Management

**Epic ID**: EPIC-033
**Title**: Product Analytics & Consent Management
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Owner**: Warren de Leon

---

## Overview

Implement PostHog product analytics alongside the Sentry error tracking (EPIC-032), unified under a single consent management system. This epic covers the analytics SDK integration, the consent database schema, onboarding consent flow, privacy settings, and re-consent mechanisms when legal documents change.

---

## Business Value

- **Product Insights**: Understand how users navigate and use the app
- **Data-Driven Decisions**: Make informed product decisions based on real usage
- **Legal Compliance**: GDPR, UK GDPR, and CCPA compliant consent management
- **User Trust**: Transparent opt-in consent with easy toggle in Settings
- **Audit Trail**: Complete history of consent changes for compliance

---

## User Stories

| Story ID                                                     | Title                              | Priority | Status   |
| ------------------------------------------------------------ | ---------------------------------- | -------- | -------- |
| [US-071](../stories/US-071-posthog-analytics-integration.md) | PostHog Analytics Integration      | High     | 📋 To Do |
| [US-072](../stories/US-072-consent-management-system.md)     | Unified Consent Management System  | Critical | 📋 To Do |
| [US-073](../stories/US-073-privacy-settings-reconsent.md)    | Privacy Settings & Re-consent Flow | High     | 📋 To Do |

---

## Tasks Summary

| Task ID  | Title                               | Story  | Status   | Priority |
| -------- | ----------------------------------- | ------ | -------- | -------- |
| TASK-383 | Install PostHog SDK                 | US-071 | 📋 To Do | High     |
| TASK-384 | Create PostHog Configuration Module | US-071 | 📋 To Do | High     |
| TASK-385 | Create Analytics Utility Layer      | US-071 | 📋 To Do | High     |
| TASK-386 | PostHog Environment Configuration   | US-071 | 📋 To Do | High     |
| TASK-387 | RNTL Tests for Analytics Utility    | US-071 | 📋 To Do | High     |
| TASK-388 | Supabase Consent Schema Migration   | US-072 | 📋 To Do | Critical |
| TASK-389 | Consent Redux Slice                 | US-072 | 📋 To Do | Critical |
| TASK-390 | Consent API Client                  | US-072 | 📋 To Do | High     |
| TASK-391 | EncryptedStore Consent Keys         | US-072 | 📋 To Do | High     |
| TASK-392 | Legal Version Tracking Config       | US-072 | 📋 To Do | High     |
| TASK-393 | ConsentScreen UI Component          | US-073 | 📋 To Do | Critical |
| TASK-394 | Onboarding Consent Navigation       | US-073 | 📋 To Do | Critical |
| TASK-395 | Privacy Settings Section            | US-073 | 📋 To Do | High     |
| TASK-396 | RNTL Tests for Consent Features     | US-073 | 📋 To Do | High     |
| TASK-397 | E2E Tests for Consent Flow          | US-073 | 📋 To Do | High     |

---

## Technical Architecture

### Services Split

| Service                 | Purpose                                          | Controlled By             |
| ----------------------- | ------------------------------------------------ | ------------------------- |
| **Sentry** (EPIC-032)   | Crash reporting, error tracking, performance     | Combined analytics toggle |
| **PostHog** (this epic) | Product analytics, user behaviour, feature usage | Combined analytics toggle |

### Consent Storage

| Data                     | Local (EncryptedStore) | Supabase              |
| ------------------------ | ---------------------- | --------------------- |
| Analytics toggle         | ✅ Fast access         | ✅ Audit trail        |
| T&C version accepted     | ✅ Works offline       | ✅ Survives reinstall |
| Privacy version accepted | ✅ Works offline       | ✅ Survives reinstall |
| Consent change history   | —                      | ✅ GDPR compliance    |

### User Experience

1. **First launch**: ConsentScreen shown before main app (GDPR requirement)
2. **T&C/Privacy update**: ConsentScreen shown with "We've updated..." message
3. **Settings access**: Privacy section with analytics toggle always available

---

## Dependencies

**Related Epics**:

- EPIC-032 (Production Logging & Error Tracking) - Sentry shares the consent toggle
- EPIC-021 (Registration & Profile Setup) - T&C acceptance during registration

**External Dependencies**:

- PostHog account with EU hosting (free tier)
- Supabase database for consent tables

---

## Acceptance Criteria

- [ ] PostHog SDK installed and configured for EU hosting
- [ ] Combined "Analytics & Diagnostics" toggle controls both Sentry and PostHog
- [ ] Consent stored locally (EncryptedStore) and synced to Supabase
- [ ] Audit log tracks all consent changes (GDPR compliance)
- [ ] First-time users see ConsentScreen before main app
- [ ] T&C/Privacy version changes trigger re-consent flow
- [ ] Privacy Settings section in SettingsScreen
- [ ] Analytics disabled in development mode
- [ ] All tests pass with `yarn validate`
- [ ] Documentation complete in `.claude/docs/`

---

## Legal Compliance

| Region           | Requirement      | Implementation                   |
| ---------------- | ---------------- | -------------------------------- |
| **EU (GDPR)**    | Opt-in required  | ✅ Default OFF, explicit consent |
| **UK (UK GDPR)** | Opt-in required  | ✅ Same as EU                    |
| **US (CCPA)**    | Opt-out allowed  | ✅ Using stricter opt-in         |
| **All**          | Audit trail      | ✅ `consent_audit_log` table     |
| **All**          | Easy withdrawal  | ✅ Settings toggle               |
| **All**          | Clear disclosure | ✅ ConsentScreen explains usage  |

---

## Risk Assessment

| Risk                      | Mitigation                                   |
| ------------------------- | -------------------------------------------- |
| PostHog API changes       | Pin SDK version, test before updating        |
| Consent sync failures     | Local-first approach, retry on reconnection  |
| Legal requirement changes | Version tracking allows quick re-consent     |
| User opts out immediately | Respect choice, track only essential metrics |

---

## Notes

**PostHog Configuration**:

- Use EU hosting (`eu.posthog.com`) for GDPR compliance
- Free tier: 1M events/month
- Disable touch heatmaps for privacy

**Integration with EPIC-032**:
TASK-380 (Environment Configuration for Sentry) should be updated to work with the shared consent system. Sentry initialisation will check consent state before enabling.

---

**Last Updated**: 2025-12-09
