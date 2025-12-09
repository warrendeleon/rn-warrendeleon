# TASK-392: Legal Version Tracking Config

**Task ID**: TASK-392
**Title**: Legal Version Tracking Config
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-072: Unified Consent Management System](../stories/US-072-consent-management-system.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Configuration

---

## Overview

Create a configuration module for tracking T&C and Privacy Policy versions. When these versions change, users must re-accept the terms before continuing to use the app.

---

## Technical Details

### Implementation

**`src/config/legalVersions.ts`**:

```typescript
/**
 * Legal Document Version Tracking
 *
 * Update these constants when T&Cs or Privacy Policy change.
 * Bumping a version will trigger re-consent for all users.
 *
 * Version format: YYYY.N (year.revision)
 * Examples: 2025.1, 2025.2, 2026.1
 */

export const CURRENT_TERMS_VERSION = '2025.1';
export const CURRENT_PRIVACY_VERSION = '2025.1';

/**
 * Check if user needs to re-accept terms
 * Returns true if either version doesn't match current
 */
export const checkNeedsReConsent = (
  acceptedTermsVersion: string | null,
  acceptedPrivacyVersion: string | null
): boolean => {
  // No acceptance = needs consent
  if (!acceptedTermsVersion || !acceptedPrivacyVersion) {
    return true;
  }

  // Version mismatch = needs re-consent
  return (
    acceptedTermsVersion !== CURRENT_TERMS_VERSION ||
    acceptedPrivacyVersion !== CURRENT_PRIVACY_VERSION
  );
};

/**
 * Get human-readable description of what changed
 * Useful for showing "We've updated our..." message
 */
export const getVersionChangeSummary = (
  acceptedTermsVersion: string | null,
  acceptedPrivacyVersion: string | null
): { termsChanged: boolean; privacyChanged: boolean } => {
  return {
    termsChanged: acceptedTermsVersion !== CURRENT_TERMS_VERSION,
    privacyChanged: acceptedPrivacyVersion !== CURRENT_PRIVACY_VERSION,
  };
};

/**
 * URLs for legal documents
 * Update if documents move to different locations
 */
export const LEGAL_DOCUMENT_URLS = {
  termsAndConditions: 'https://warrendeleon.com/terms',
  privacyPolicy: 'https://warrendeleon.com/privacy',
} as const;
```

---

## Files to Create

| File                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `src/config/legalVersions.ts` | Version tracking and re-consent logic |

---

## Acceptance Criteria

- [ ] `CURRENT_TERMS_VERSION` constant defined with format `YYYY.N`
- [ ] `CURRENT_PRIVACY_VERSION` constant defined
- [ ] `checkNeedsReConsent()` returns true when versions don't match
- [ ] `checkNeedsReConsent()` returns true when acceptance is null
- [ ] `checkNeedsReConsent()` returns false when versions match
- [ ] `getVersionChangeSummary()` identifies which docs changed
- [ ] `LEGAL_DOCUMENT_URLS` contains correct URLs
- [ ] Clear documentation comments explain versioning strategy
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: First-time User**

```gherkin
Given a user has never accepted terms
When checkNeedsReConsent(null, null) is called
Then it should return true
```

**Scenario 2: Up-to-date User**

```gherkin
Given a user has accepted current versions
When checkNeedsReConsent('2025.1', '2025.1') is called
Then it should return false
```

**Scenario 3: Outdated Terms**

```gherkin
Given CURRENT_TERMS_VERSION is '2025.2'
And user accepted '2025.1'
When checkNeedsReConsent('2025.1', '2025.2') is called
Then it should return true
```

**Scenario 4: Both Outdated**

```gherkin
Given both versions have been bumped
When getVersionChangeSummary is called with old versions
Then termsChanged should be true
And privacyChanged should be true
```

---

## Dependencies

**Blocked By**: None

**Blocks**: TASK-393, TASK-394

---

## Notes

**Version Bump Process**:
When legal documents change:

1. Update `CURRENT_TERMS_VERSION` or `CURRENT_PRIVACY_VERSION`
2. Update the "Last Updated" date in the actual legal screens
3. Deploy the app
4. All users will see the ConsentScreen on next launch

**Version Format**:
Using `YYYY.N` format (e.g., `2025.1`, `2025.2`) because:

- Easy to understand when a version was created
- Simple to increment
- Natural ordering works for comparisons

**Re-consent UX**:
When `checkNeedsReConsent` returns true, the navigation should:

1. Block access to main app
2. Show ConsentScreen with "We've updated our..." message
3. Require re-acceptance before proceeding

---

**Last Updated**: 2025-12-09
