# TASK-388: Supabase Consent Schema Migration

**Task ID**: TASK-388
**Title**: Supabase Consent Schema Migration
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-072: Unified Consent Management System](../stories/US-072-consent-management-system.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Database

---

## Overview

Create the Supabase database schema for consent management. This includes the `user_consent` table for storing current preferences and the `consent_audit_log` table for GDPR-compliant audit trail of all consent changes.

---

## Technical Details

### Migration File

**`supabase/migrations/YYYYMMDD_user_consent.sql`**:

```sql
-- User consent preferences (synced with local storage)
CREATE TABLE IF NOT EXISTS user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Combined consent for analytics (Sentry + PostHog)
  analytics_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Version tracking for re-consent when legal docs change
  terms_version_accepted VARCHAR(20),      -- e.g., '2025.1'
  privacy_version_accepted VARCHAR(20),    -- e.g., '2025.1'
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,

  -- Metadata
  consent_updated_at TIMESTAMPTZ DEFAULT NOW(),
  consent_ip_address INET,
  device_locale VARCHAR(10),               -- e.g., 'en-GB', 'de-DE'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Audit log for GDPR compliance (tracks ALL consent changes)
CREATE TABLE IF NOT EXISTS consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  action VARCHAR(50) NOT NULL,             -- 'analytics_granted', 'analytics_revoked', 'terms_accepted', 'privacy_accepted'
  previous_value JSONB,                    -- Previous state before change
  new_value JSONB,                         -- New state after change

  ip_address INET,
  user_agent TEXT,
  device_locale VARCHAR(10),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_user ON user_consent(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_user ON consent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_date ON consent_audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read/write their own consent
CREATE POLICY user_consent_select_policy ON user_consent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_consent_insert_policy ON user_consent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_consent_update_policy ON user_consent
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can read their own audit log
CREATE POLICY consent_audit_select_policy ON consent_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Inserts to audit log happen via service role (from Edge Functions)
-- Users cannot directly insert to audit log

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.consent_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_consent_timestamp
  BEFORE UPDATE ON user_consent
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_updated_at();

-- Trigger to log consent changes to audit log
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log analytics_enabled changes
  IF OLD.analytics_enabled IS DISTINCT FROM NEW.analytics_enabled THEN
    INSERT INTO consent_audit_log (user_id, action, previous_value, new_value, device_locale)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.analytics_enabled THEN 'analytics_granted' ELSE 'analytics_revoked' END,
      jsonb_build_object('analytics_enabled', OLD.analytics_enabled),
      jsonb_build_object('analytics_enabled', NEW.analytics_enabled),
      NEW.device_locale
    );
  END IF;

  -- Log terms acceptance
  IF OLD.terms_version_accepted IS DISTINCT FROM NEW.terms_version_accepted AND NEW.terms_version_accepted IS NOT NULL THEN
    INSERT INTO consent_audit_log (user_id, action, previous_value, new_value, device_locale)
    VALUES (
      NEW.user_id,
      'terms_accepted',
      jsonb_build_object('version', OLD.terms_version_accepted),
      jsonb_build_object('version', NEW.terms_version_accepted),
      NEW.device_locale
    );
  END IF;

  -- Log privacy acceptance
  IF OLD.privacy_version_accepted IS DISTINCT FROM NEW.privacy_version_accepted AND NEW.privacy_version_accepted IS NOT NULL THEN
    INSERT INTO consent_audit_log (user_id, action, previous_value, new_value, device_locale)
    VALUES (
      NEW.user_id,
      'privacy_accepted',
      jsonb_build_object('version', OLD.privacy_version_accepted),
      jsonb_build_object('version', NEW.privacy_version_accepted),
      NEW.device_locale
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_audit_trigger
  AFTER UPDATE ON user_consent
  FOR EACH ROW
  EXECUTE FUNCTION log_consent_change();
```

---

## Files to Create

| File                                            | Purpose                               |
| ----------------------------------------------- | ------------------------------------- |
| `supabase/migrations/YYYYMMDD_user_consent.sql` | Database migration for consent tables |

---

## Acceptance Criteria

- [ ] Migration file created with correct naming convention
- [ ] `user_consent` table created with all required columns
- [ ] `consent_audit_log` table created for GDPR audit trail
- [ ] RLS policies restrict access to own data only
- [ ] Indexes created for user_id and audit log queries
- [ ] `updated_at` trigger automatically updates timestamp
- [ ] Audit trigger logs all consent changes automatically
- [ ] Migration runs successfully on Supabase
- [ ] No errors in Supabase dashboard
- [ ] Documentation added explaining table structure

---

## Test Scenarios

**Scenario 1: RLS Policy - User Access**

```gherkin
Given a user is authenticated
When they query user_consent
Then they should only see their own record
And they should NOT see other users' consent
```

**Scenario 2: Audit Log Trigger**

```gherkin
Given a user has a consent record
When they update analytics_enabled from false to true
Then a new row should be added to consent_audit_log
And the action should be 'analytics_granted'
And the previous_value should contain false
And the new_value should contain true
```

**Scenario 3: Terms Acceptance Logging**

```gherkin
Given a user accepts terms version '2025.1'
When the user_consent record is updated
Then consent_audit_log should have a 'terms_accepted' entry
And the new_value should contain version '2025.1'
```

---

## Dependencies

**Blocked By**: None

**Blocks**: TASK-389, TASK-390

---

## Notes

**GDPR Compliance**:
The `consent_audit_log` table provides a complete audit trail of all consent changes, which is required for GDPR compliance. The `ON DELETE SET NULL` ensures audit records are preserved even if a user deletes their account.

**Audit Log Immutability**:
The audit log table has no UPDATE or DELETE policies for users. Once a record is created, it cannot be modified. This ensures audit integrity.

**Migration Naming**:
Use date format `YYYYMMDD` for the migration file, e.g., `20251209_user_consent.sql`.

---

**Last Updated**: 2025-12-09
