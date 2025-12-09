# TASK-389: Consent Redux Slice

**Task ID**: TASK-389
**Title**: Consent Redux Slice
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-072: Unified Consent Management System](../stories/US-072-consent-management-system.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: State Management

---

## Overview

Create a Redux Toolkit slice to manage consent state in the app. This slice handles analytics consent, T&C/Privacy version tracking, and re-consent detection.

---

## Technical Details

### Implementation

**`src/features/Consent/store/reducer.ts`**:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConsentState {
  // Analytics consent (controls Sentry + PostHog)
  analyticsEnabled: boolean;

  // Legal document version tracking
  termsVersionAccepted: string | null;
  privacyVersionAccepted: string | null;
  termsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;

  // UI state
  isLoading: boolean;
  needsReConsent: boolean; // True when T&Cs/Privacy updated
  error: string | null;
}

const initialState: ConsentState = {
  analyticsEnabled: false, // Opt-in default (GDPR compliant)
  termsVersionAccepted: null,
  privacyVersionAccepted: null,
  termsAcceptedAt: null,
  privacyAcceptedAt: null,
  isLoading: false,
  needsReConsent: false,
  error: null,
};

const consentSlice = createSlice({
  name: 'consent',
  initialState,
  reducers: {
    setAnalyticsEnabled: (state, action: PayloadAction<boolean>) => {
      state.analyticsEnabled = action.payload;
    },
    setTermsAccepted: (state, action: PayloadAction<{ version: string; acceptedAt: string }>) => {
      state.termsVersionAccepted = action.payload.version;
      state.termsAcceptedAt = action.payload.acceptedAt;
    },
    setPrivacyAccepted: (state, action: PayloadAction<{ version: string; acceptedAt: string }>) => {
      state.privacyVersionAccepted = action.payload.version;
      state.privacyAcceptedAt = action.payload.acceptedAt;
    },
    setNeedsReConsent: (state, action: PayloadAction<boolean>) => {
      state.needsReConsent = action.payload;
    },
    setConsentLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setConsentError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetConsentState: () => initialState,
    hydrateConsent: (state, action: PayloadAction<Partial<ConsentState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setAnalyticsEnabled,
  setTermsAccepted,
  setPrivacyAccepted,
  setNeedsReConsent,
  setConsentLoading,
  setConsentError,
  resetConsentState,
  hydrateConsent,
} = consentSlice.actions;

export default consentSlice.reducer;
```

**`src/features/Consent/store/selectors.ts`**:

```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@app/store/configureStore';

export const selectConsentState = (state: RootState) => state.consent;

export const selectAnalyticsEnabled = createSelector(
  selectConsentState,
  consent => consent.analyticsEnabled
);

export const selectTermsVersionAccepted = createSelector(
  selectConsentState,
  consent => consent.termsVersionAccepted
);

export const selectPrivacyVersionAccepted = createSelector(
  selectConsentState,
  consent => consent.privacyVersionAccepted
);

export const selectNeedsReConsent = createSelector(
  selectConsentState,
  consent => consent.needsReConsent
);

export const selectHasAcceptedTerms = createSelector(
  selectConsentState,
  consent => consent.termsVersionAccepted !== null && consent.privacyVersionAccepted !== null
);

export const selectConsentLoading = createSelector(
  selectConsentState,
  consent => consent.isLoading
);

export const selectConsentError = createSelector(selectConsentState, consent => consent.error);
```

**`src/features/Consent/store/index.ts`**:

```typescript
export { default as consentReducer } from './reducer';
export * from './reducer';
export * from './selectors';
```

---

## Files to Create

| File                                      | Purpose                  |
| ----------------------------------------- | ------------------------ |
| `src/features/Consent/store/reducer.ts`   | Redux slice with actions |
| `src/features/Consent/store/selectors.ts` | Memoised selectors       |
| `src/features/Consent/store/index.ts`     | Export barrel            |

## Files to Modify

| File                          | Changes                             |
| ----------------------------- | ----------------------------------- |
| `src/store/configureStore.ts` | Add consent reducer to root reducer |

---

## Acceptance Criteria

- [ ] Consent Redux slice created with all required state
- [ ] Actions for setting analytics, terms, privacy acceptance
- [ ] `needsReConsent` flag for triggering re-consent flow
- [ ] `hydrateConsent` action for loading from storage
- [ ] Selectors created with `createSelector` for memoisation
- [ ] `selectHasAcceptedTerms` correctly checks both T&C and Privacy
- [ ] Consent reducer added to root reducer in configureStore
- [ ] Initial state defaults to `analyticsEnabled: false` (opt-in)
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Initial State**

```gherkin
Given the app loads for the first time
When the consent state is accessed
Then analyticsEnabled should be false
And termsVersionAccepted should be null
And needsReConsent should be false
```

**Scenario 2: Set Analytics Enabled**

```gherkin
Given the consent state is at initial values
When setAnalyticsEnabled(true) is dispatched
Then analyticsEnabled should be true
```

**Scenario 3: Has Accepted Terms Selector**

```gherkin
Given termsVersionAccepted is null
When selectHasAcceptedTerms is called
Then it should return false

Given termsVersionAccepted is '2025.1'
And privacyVersionAccepted is '2025.1'
When selectHasAcceptedTerms is called
Then it should return true
```

---

## Dependencies

**Blocked By**: None

**Blocks**: TASK-393, TASK-394, TASK-395

---

## Notes

**Opt-in Default**:
The `analyticsEnabled` initial value is `false` to comply with GDPR opt-in requirements. Users must explicitly enable analytics.

**Integration with configureStore**:
The consent reducer should be added but NOT persisted with redux-persist. Consent is persisted in EncryptedStore (TASK-391) for better security.

```typescript
// In configureStore.ts
rootReducer: {
  // ... other reducers
  consent: consentReducer,  // NOT in persist whitelist
}
```

---

**Last Updated**: 2025-12-09
