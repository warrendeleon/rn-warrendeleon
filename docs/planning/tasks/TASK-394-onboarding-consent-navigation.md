# TASK-394: Onboarding Consent Navigation

**Task ID**: TASK-394
**Title**: Onboarding Consent Navigation
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-073: Privacy Settings & Re-consent Flow](../stories/US-073-privacy-settings-reconsent.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Navigation

---

## Overview

Integrate the ConsentScreen into the app navigation. The consent screen should block access to the main app on first launch and when legal documents are updated, ensuring GDPR compliance (consent before data collection).

---

## Technical Details

### Navigation Integration

**`src/navigation/RootNavigator/RootNavigator.tsx`** (update):

```typescript
import { useSelector } from 'react-redux';
import { selectHasAcceptedTerms, selectNeedsReConsent } from '@app/features/Consent/store/selectors';
import { ConsentScreen } from '@app/features/Consent/ConsentScreen';

// Inside RootNavigator component
const hasAcceptedTerms = useSelector(selectHasAcceptedTerms);
const needsReConsent = useSelector(selectNeedsReConsent);

// Show ConsentScreen if:
// 1. First launch (no terms accepted)
// 2. T&Cs or Privacy Policy version updated
const showConsentScreen = !hasAcceptedTerms || needsReConsent;

if (showConsentScreen) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Consent" component={ConsentScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}

// Continue with regular navigation...
```

### Consent Check on App Start

**`src/app/App.tsx`** (update):

```typescript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadConsentFromStorage } from '@app/features/Consent/storage/consentStorage';
import { hydrateConsent, setNeedsReConsent } from '@app/features/Consent/store/reducer';
import { checkNeedsReConsent } from '@app/config/legalVersions';

// Inside App component
useEffect(() => {
  const initConsent = async () => {
    // Load consent from local storage
    const storedConsent = await loadConsentFromStorage();

    // Hydrate Redux with stored values
    dispatch(
      hydrateConsent({
        analyticsEnabled: storedConsent.analyticsEnabled,
        termsVersionAccepted: storedConsent.termsVersionAccepted,
        privacyVersionAccepted: storedConsent.privacyVersionAccepted,
        termsAcceptedAt: storedConsent.termsAcceptedAt,
        privacyAcceptedAt: storedConsent.privacyAcceptedAt,
      })
    );

    // Check if re-consent needed
    const needsReConsent = checkNeedsReConsent(
      storedConsent.termsVersionAccepted,
      storedConsent.privacyVersionAccepted
    );
    dispatch(setNeedsReConsent(needsReConsent));

    // Initialise analytics if previously consented
    if (storedConsent.analyticsEnabled && !needsReConsent) {
      await initSentry(true);
      await initPostHog(true);
    }
  };

  initConsent();
}, [dispatch]);
```

### Navigation Types

**Update `src/navigation/types.ts`**:

```typescript
export type RootStackParamList = {
  // Consent flow
  Consent: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;

  // Main app (existing)
  Home: undefined;
  Settings: undefined;
  // ... other screens
};
```

---

## Files to Modify

| File                                             | Changes                                 |
| ------------------------------------------------ | --------------------------------------- |
| `src/navigation/RootNavigator/RootNavigator.tsx` | Add consent check and navigation        |
| `src/navigation/types.ts`                        | Add Consent screen type                 |
| `src/app/App.tsx`                                | Add consent initialisation on app start |

---

## Acceptance Criteria

- [ ] ConsentScreen shown on first app launch
- [ ] ConsentScreen blocks access to main app until terms accepted
- [ ] T&C and Privacy screens navigable from ConsentScreen
- [ ] After accepting, user proceeds to normal app flow
- [ ] Re-consent flow triggers when legal versions change
- [ ] Consent loaded from storage on app start
- [ ] Analytics initialised only if consent granted and not re-consent
- [ ] Navigation types updated for TypeScript
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: First Launch**

```gherkin
Given the app is freshly installed
When the app launches
Then the ConsentScreen should be displayed
And the main app should NOT be accessible
```

**Scenario 2: Returning User with Consent**

```gherkin
Given a user has previously accepted terms
And the legal versions have not changed
When the app launches
Then the ConsentScreen should NOT be displayed
And the user should see the main app
```

**Scenario 3: Terms Updated**

```gherkin
Given a user has previously accepted version '2025.1'
And CURRENT_TERMS_VERSION is now '2025.2'
When the app launches
Then the ConsentScreen should be displayed
And the header should say "We've Updated Our Policies"
```

**Scenario 4: Navigate to Terms from Consent**

```gherkin
Given I am on the ConsentScreen
When I tap "Terms & Conditions"
Then I should see the TermsAndConditionsScreen
And I should be able to go back to ConsentScreen
```

---

## Dependencies

**Blocked By**: TASK-389, TASK-391, TASK-392, TASK-393

**Blocks**: TASK-396, TASK-397

---

## Notes

**GDPR Requirement**:
The ConsentScreen MUST be shown before any data collection begins. This means:

- No Sentry/PostHog initialised until after consent
- Navigation blocks main app until terms accepted
- Storage of consent preference is the first thing that happens

**Re-consent Detection**:
The `checkNeedsReConsent` function compares stored versions against current versions. If there's a mismatch, the user must re-accept.

**Analytics Initialisation Order**:

1. Load consent from storage
2. Check if re-consent needed
3. If no re-consent AND previously consented → init analytics
4. Otherwise → wait until ConsentScreen completion

---

**Last Updated**: 2025-12-09
