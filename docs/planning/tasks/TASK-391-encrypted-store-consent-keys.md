# TASK-391: EncryptedStore Consent Keys

**Task ID**: TASK-391
**Title**: EncryptedStore Consent Keys
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-072: Unified Consent Management System](../stories/US-072-consent-management-system.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Storage

---

## Overview

Add consent-related keys to the EncryptedStore for local persistence. This enables offline consent functionality and fast access without network calls.

---

## Technical Details

### Implementation

**`src/utils/storage/EncryptedStore.ts`** (update enum):

```typescript
export enum EncryptedStoreKey {
  // Existing keys...
  USER_EMAIL = 'userEmail',
  USER_FIRST_NAME = 'userFirstName',
  USER_LAST_NAME = 'userLastName',
  USER_PHONE_NUMBER = 'userPhoneNumber',
  PROFILE_PICTURE_URL = 'profilePictureURL',
  AUTH_PROVIDER = 'authProvider',

  // NEW: Consent keys
  CONSENT_ANALYTICS_ENABLED = 'consentAnalyticsEnabled',
  CONSENT_TERMS_VERSION = 'consentTermsVersion',
  CONSENT_PRIVACY_VERSION = 'consentPrivacyVersion',
  CONSENT_TERMS_ACCEPTED_AT = 'consentTermsAcceptedAt',
  CONSENT_PRIVACY_ACCEPTED_AT = 'consentPrivacyAcceptedAt',
}
```

### Consent Storage Helpers

**`src/features/Consent/storage/consentStorage.ts`**:

```typescript
import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';

export interface StoredConsent {
  analyticsEnabled: boolean;
  termsVersionAccepted: string | null;
  privacyVersionAccepted: string | null;
  termsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
}

/**
 * Load consent from encrypted local storage
 */
export const loadConsentFromStorage = async (): Promise<StoredConsent> => {
  const [analyticsEnabled, termsVersion, privacyVersion, termsAcceptedAt, privacyAcceptedAt] =
    await Promise.all([
      EncryptedStore.get(EncryptedStoreKey.CONSENT_ANALYTICS_ENABLED),
      EncryptedStore.get(EncryptedStoreKey.CONSENT_TERMS_VERSION),
      EncryptedStore.get(EncryptedStoreKey.CONSENT_PRIVACY_VERSION),
      EncryptedStore.get(EncryptedStoreKey.CONSENT_TERMS_ACCEPTED_AT),
      EncryptedStore.get(EncryptedStoreKey.CONSENT_PRIVACY_ACCEPTED_AT),
    ]);

  return {
    analyticsEnabled: analyticsEnabled === 'true',
    termsVersionAccepted: termsVersion,
    privacyVersionAccepted: privacyVersion,
    termsAcceptedAt,
    privacyAcceptedAt,
  };
};

/**
 * Save consent to encrypted local storage
 */
export const saveConsentToStorage = async (consent: Partial<StoredConsent>): Promise<void> => {
  const operations: Promise<void>[] = [];

  if (consent.analyticsEnabled !== undefined) {
    operations.push(
      EncryptedStore.set(
        EncryptedStoreKey.CONSENT_ANALYTICS_ENABLED,
        consent.analyticsEnabled.toString()
      )
    );
  }

  if (consent.termsVersionAccepted !== undefined) {
    operations.push(
      consent.termsVersionAccepted
        ? EncryptedStore.set(EncryptedStoreKey.CONSENT_TERMS_VERSION, consent.termsVersionAccepted)
        : EncryptedStore.remove(EncryptedStoreKey.CONSENT_TERMS_VERSION)
    );
  }

  if (consent.privacyVersionAccepted !== undefined) {
    operations.push(
      consent.privacyVersionAccepted
        ? EncryptedStore.set(
            EncryptedStoreKey.CONSENT_PRIVACY_VERSION,
            consent.privacyVersionAccepted
          )
        : EncryptedStore.remove(EncryptedStoreKey.CONSENT_PRIVACY_VERSION)
    );
  }

  if (consent.termsAcceptedAt !== undefined) {
    operations.push(
      consent.termsAcceptedAt
        ? EncryptedStore.set(EncryptedStoreKey.CONSENT_TERMS_ACCEPTED_AT, consent.termsAcceptedAt)
        : EncryptedStore.remove(EncryptedStoreKey.CONSENT_TERMS_ACCEPTED_AT)
    );
  }

  if (consent.privacyAcceptedAt !== undefined) {
    operations.push(
      consent.privacyAcceptedAt
        ? EncryptedStore.set(
            EncryptedStoreKey.CONSENT_PRIVACY_ACCEPTED_AT,
            consent.privacyAcceptedAt
          )
        : EncryptedStore.remove(EncryptedStoreKey.CONSENT_PRIVACY_ACCEPTED_AT)
    );
  }

  await Promise.all(operations);
};

/**
 * Clear all consent data from local storage
 */
export const clearConsentStorage = async (): Promise<void> => {
  await Promise.all([
    EncryptedStore.remove(EncryptedStoreKey.CONSENT_ANALYTICS_ENABLED),
    EncryptedStore.remove(EncryptedStoreKey.CONSENT_TERMS_VERSION),
    EncryptedStore.remove(EncryptedStoreKey.CONSENT_PRIVACY_VERSION),
    EncryptedStore.remove(EncryptedStoreKey.CONSENT_TERMS_ACCEPTED_AT),
    EncryptedStore.remove(EncryptedStoreKey.CONSENT_PRIVACY_ACCEPTED_AT),
  ]);
};
```

---

## Files to Modify

| File                                  | Changes                  |
| ------------------------------------- | ------------------------ |
| `src/utils/storage/EncryptedStore.ts` | Add consent keys to enum |

## Files to Create

| File                                             | Purpose                 |
| ------------------------------------------------ | ----------------------- |
| `src/features/Consent/storage/consentStorage.ts` | Consent storage helpers |

---

## Acceptance Criteria

- [ ] Consent keys added to `EncryptedStoreKey` enum
- [ ] `loadConsentFromStorage()` returns all consent fields
- [ ] `saveConsentToStorage()` handles partial updates
- [ ] `clearConsentStorage()` removes all consent keys
- [ ] Boolean conversion handled correctly (string → boolean)
- [ ] Null values properly handled (remove key vs set empty)
- [ ] Parallel operations for performance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Load Empty Storage**

```gherkin
Given no consent has been stored
When loadConsentFromStorage() is called
Then analyticsEnabled should be false
And all version fields should be null
```

**Scenario 2: Save Analytics Consent**

```gherkin
Given consent storage is empty
When saveConsentToStorage({ analyticsEnabled: true }) is called
Then CONSENT_ANALYTICS_ENABLED should be 'true'
```

**Scenario 3: Load Existing Consent**

```gherkin
Given consent has been saved with analyticsEnabled: true
When loadConsentFromStorage() is called
Then analyticsEnabled should be boolean true
```

**Scenario 4: Clear Storage**

```gherkin
Given consent is stored
When clearConsentStorage() is called
Then all consent keys should be removed
And loadConsentFromStorage should return defaults
```

---

## Dependencies

**Blocked By**: None (EncryptedStore already exists)

**Blocks**: TASK-393, TASK-394

---

## Notes

**Boolean Storage**:
EncryptedStore stores strings, so booleans must be converted:

- Save: `boolean.toString()` → `'true'` or `'false'`
- Load: `value === 'true'` → boolean

**Why Not Redux Persist?**:
Consent data is stored in EncryptedStore rather than via redux-persist because:

1. Consent is sensitive (privacy preference)
2. EncryptedStore uses platform-specific encryption
3. More control over when sync happens

---

**Last Updated**: 2025-12-09
