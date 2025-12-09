# US-072: Unified Consent Management System

**Story ID**: US-072
**Title**: Unified Consent Management System
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-09

---

## User Story

**As a** user
**I want** my privacy preferences stored securely and persistently
**So that** my choices are remembered across sessions and device reinstalls

**As a** compliance officer
**I want** a complete audit trail of consent changes
**So that** we can demonstrate GDPR compliance if audited

---

## Description

Implement the backend data layer for consent management. This includes Supabase database tables for consent storage and audit logging, local encrypted storage for fast access, Redux state management, and sync logic between local and remote storage.

---

## Tasks

| Task ID                                                       | Title                             | Status   | Priority |
| ------------------------------------------------------------- | --------------------------------- | -------- | -------- |
| [TASK-388](../tasks/TASK-388-supabase-consent-schema.md)      | Supabase Consent Schema Migration | 📋 To Do | Critical |
| [TASK-389](../tasks/TASK-389-consent-redux-slice.md)          | Consent Redux Slice               | 📋 To Do | Critical |
| [TASK-390](../tasks/TASK-390-consent-api-client.md)           | Consent API Client                | 📋 To Do | High     |
| [TASK-391](../tasks/TASK-391-encrypted-store-consent-keys.md) | EncryptedStore Consent Keys       | 📋 To Do | High     |
| [TASK-392](../tasks/TASK-392-legal-version-tracking.md)       | Legal Version Tracking Config     | 📋 To Do | High     |

---

## Acceptance Criteria

- [ ] Supabase `user_consent` table created with RLS policies
- [ ] Supabase `consent_audit_log` table tracks all consent changes
- [ ] Redux slice manages consent state with proper actions/selectors
- [ ] EncryptedStore keys added for local consent persistence
- [ ] Consent API client handles CRUD operations with Supabase
- [ ] Two-way sync: local → Supabase (on change), Supabase → local (on login)
- [ ] Version tracking config for T&Cs and Privacy Policy
- [ ] `checkNeedsReConsent()` function correctly detects version mismatches
- [ ] Offline-first: consent works without network, syncs when available
- [ ] `yarn validate` passes with 0 errors

---

## Data Model

### Supabase Tables

**`user_consent`**:

```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- analytics_enabled: BOOLEAN (default false)
- terms_version_accepted: VARCHAR
- privacy_version_accepted: VARCHAR
- terms_accepted_at: TIMESTAMPTZ
- privacy_accepted_at: TIMESTAMPTZ
- device_locale: VARCHAR
- created_at, updated_at: TIMESTAMPTZ
```

**`consent_audit_log`**:

```sql
- id: UUID (PK)
- user_id: UUID (FK)
- action: VARCHAR ('granted', 'revoked', 'terms_accepted')
- previous_value: JSONB
- new_value: JSONB
- ip_address: INET
- created_at: TIMESTAMPTZ
```

### Local Storage (EncryptedStore)

```typescript
CONSENT_ANALYTICS_ENABLED = 'consentAnalyticsEnabled';
CONSENT_TERMS_VERSION = 'consentTermsVersion';
CONSENT_PRIVACY_VERSION = 'consentPrivacyVersion';
```

---

## Sync Strategy

```
User changes consent → Update EncryptedStore (immediate) → Sync to Supabase (async)
App launch → Load from EncryptedStore (fast) → Fetch from Supabase (if logged in) → Reconcile
```

---

## Out of Scope

- ConsentScreen UI (covered in US-073)
- PostHog SDK (covered in US-071)
- Sentry integration (covered in EPIC-032)

---

**Last Updated**: 2025-12-09
