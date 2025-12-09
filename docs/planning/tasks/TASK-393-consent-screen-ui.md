# TASK-393: ConsentScreen UI Component

**Task ID**: TASK-393
**Title**: ConsentScreen UI Component
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-073: Privacy Settings & Re-consent Flow](../stories/US-073-privacy-settings-reconsent.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: UI Component

---

## Overview

Create the ConsentScreen component that displays on first app launch and when legal documents are updated. Users must accept T&Cs before proceeding, and can optionally enable analytics.

**Design Requirements**:

- iOS 26 look and feel (grouped settings style, SF Pro styling)
- GlueStack UI components exclusively (no React Native primitives)
- Dark/light mode support using `useAppColorScheme` hook
- Consistent with existing SettingsScreen patterns

---

## Technical Details

### Design Principles

**iOS 26 Design Language**:

- Grouped inset card style with rounded corners (`$2xl` radius)
- Section headers: uppercase, `$xs` font, `$textDark400`/`$textLight500` colour
- Background: `$black`/`$coolGray100` for dark/light modes
- Cards: `$coolGray900`/`$white` for dark/light modes
- Generous spacing: `$4` padding, `$6` between sections
- SF Pro-inspired typography via GlueStack defaults

**Component Pattern**:
Uses existing `SettingsGroup`, `SettingsItem`, and `ButtonGroup` components where applicable for consistency with the rest of the app.

### Component Structure

**`src/features/Consent/ConsentScreen.tsx`**:

```typescript
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Text,
  Switch,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  CheckIcon,
  Button,
  ButtonText,
  ScrollView,
  HStack,
  VStack,
  Pressable,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ChartBar, FileText, Shield } from 'lucide-react-native';

import {
  setAnalyticsEnabled,
  setTermsAccepted,
  setPrivacyAccepted,
  setNeedsReConsent,
} from './store/reducer';
import { selectNeedsReConsent } from './store/selectors';
import {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
} from '@app/config/legalVersions';
import { saveConsentToStorage } from './storage/consentStorage';
import { initSentry } from '@app/config/sentry';
import { initPostHog } from '@app/config/posthog';
import { useAppColorScheme } from '@app/shared/hooks';

export const ConsentScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const needsReConsent = useSelector(selectNeedsReConsent);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Local state for form
  const [analyticsEnabled, setAnalyticsToggle] = useState(false);
  const [termsAccepted, setTermsAcceptedLocal] = useState(false);

  const handleContinue = useCallback(async () => {
    const now = new Date().toISOString();

    // Update Redux state
    dispatch(setAnalyticsEnabled(analyticsEnabled));
    dispatch(setTermsAccepted({ version: CURRENT_TERMS_VERSION, acceptedAt: now }));
    dispatch(setPrivacyAccepted({ version: CURRENT_PRIVACY_VERSION, acceptedAt: now }));
    dispatch(setNeedsReConsent(false));

    // Persist to local storage
    await saveConsentToStorage({
      analyticsEnabled,
      termsVersionAccepted: CURRENT_TERMS_VERSION,
      privacyVersionAccepted: CURRENT_PRIVACY_VERSION,
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
    });

    // Initialise analytics services if enabled
    if (analyticsEnabled) {
      await initSentry(true);
      await initPostHog(true);
    }

    // TODO: Sync to Supabase when user is logged in
  }, [analyticsEnabled, dispatch]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      flex={1}
      bg={isDark ? '$black' : '$coolGray100'}
      testID="consent-screen"
    >
      <Box p="$4">
        {/* Header Section */}
        <Box alignItems="center" py="$6">
          <Box
            bg={isDark ? '$primary900' : '$primary100'}
            p="$4"
            borderRadius="$full"
            mb="$4"
          >
            <Shield
              size={40}
              color={isDark ? '#60A5FA' : '#2563EB'}
              accessibilityElementsHidden
            />
          </Box>
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            textAlign="center"
            color={isDark ? '$white' : '$black'}
            accessibilityRole="header"
          >
            {needsReConsent
              ? t('consent.header.updated')
              : t('consent.header.welcome')}
          </Text>
          <Text
            fontSize="$sm"
            textAlign="center"
            mt="$2"
            color={isDark ? '$textDark400' : '$textLight600'}
            px="$4"
          >
            {t('consent.description')}
          </Text>
        </Box>

        {/* Analytics Toggle Card - iOS Grouped Style */}
        <Box mt="$2">
          <Text
            mb="$2"
            ml="$4"
            fontSize="$xs"
            fontWeight="$medium"
            textTransform="uppercase"
            color={isDark ? '$textDark400' : '$textLight500'}
            accessibilityRole="header"
          >
            {t('consent.analytics.sectionTitle')}
          </Text>
          <Box
            bg={isDark ? '$coolGray900' : '$white'}
            borderRadius="$2xl"
            overflow="hidden"
          >
            <HStack
              justifyContent="space-between"
              alignItems="center"
              p="$4"
            >
              <HStack space="md" alignItems="center" flex={1}>
                <Box
                  bg="$blue500"
                  p="$2"
                  borderRadius="$lg"
                >
                  <ChartBar size={20} color="#FFFFFF" accessibilityElementsHidden />
                </Box>
                <VStack flex={1}>
                  <Text
                    fontWeight="$semibold"
                    color={isDark ? '$white' : '$black'}
                  >
                    {t('consent.analytics.title')}
                  </Text>
                  <Text
                    fontSize="$xs"
                    color={isDark ? '$textDark400' : '$textLight600'}
                  >
                    {t('consent.analytics.description')}
                  </Text>
                </VStack>
              </HStack>
              <Switch
                value={analyticsEnabled}
                onValueChange={setAnalyticsToggle}
                accessibilityRole="switch"
                accessibilityLabel={t('consent.analytics.title')}
                accessibilityHint={t('consent.analytics.hint')}
                accessibilityState={{ checked: analyticsEnabled }}
                testID="analytics-toggle"
              />
            </HStack>
          </Box>
        </Box>

        {/* Legal Documents Section - iOS Grouped Style */}
        <Box mt="$6">
          <Text
            mb="$2"
            ml="$4"
            fontSize="$xs"
            fontWeight="$medium"
            textTransform="uppercase"
            color={isDark ? '$textDark400' : '$textLight500'}
            accessibilityRole="header"
          >
            {t('consent.legal.sectionTitle')}
          </Text>
          <Box
            bg={isDark ? '$coolGray900' : '$white'}
            borderRadius="$2xl"
            overflow="hidden"
          >
            {/* Terms & Conditions Row */}
            <Pressable
              onPress={() => navigation.navigate('TermsAndConditions')}
              accessibilityRole="link"
              accessibilityLabel={t('consent.links.terms')}
              testID="terms-link"
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                p="$4"
                borderBottomWidth={1}
                borderBottomColor={isDark ? '$coolGray800' : '$coolGray200'}
              >
                <HStack space="md" alignItems="center">
                  <Box bg="$orange500" p="$2" borderRadius="$lg">
                    <FileText size={20} color="#FFFFFF" accessibilityElementsHidden />
                  </Box>
                  <Text color={isDark ? '$white' : '$black'}>
                    {t('consent.links.terms')}
                  </Text>
                </HStack>
                <Text color={isDark ? '$textDark400' : '$textLight500'}>›</Text>
              </HStack>
            </Pressable>

            {/* Privacy Policy Row */}
            <Pressable
              onPress={() => navigation.navigate('PrivacyPolicy')}
              accessibilityRole="link"
              accessibilityLabel={t('consent.links.privacy')}
              testID="privacy-link"
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                p="$4"
              >
                <HStack space="md" alignItems="center">
                  <Box bg="$green500" p="$2" borderRadius="$lg">
                    <Shield size={20} color="#FFFFFF" accessibilityElementsHidden />
                  </Box>
                  <Text color={isDark ? '$white' : '$black'}>
                    {t('consent.links.privacy')}
                  </Text>
                </HStack>
                <Text color={isDark ? '$textDark400' : '$textLight500'}>›</Text>
              </HStack>
            </Pressable>
          </Box>
        </Box>

        {/* Accept Terms Checkbox */}
        <Box mt="$6" px="$2">
          <Checkbox
            value="terms"
            isChecked={termsAccepted}
            onChange={setTermsAcceptedLocal}
            accessibilityRole="checkbox"
            accessibilityLabel={t('consent.accept.label')}
            accessibilityState={{ checked: termsAccepted }}
            testID="terms-checkbox"
          >
            <CheckboxIndicator mr="$3">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel
              color={isDark ? '$textDark300' : '$textLight700'}
              fontSize="$sm"
            >
              {t('consent.accept.label')}
            </CheckboxLabel>
          </Checkbox>
        </Box>

        {/* Continue Button - iOS Style */}
        <Box mt="$6" mb="$8">
          <Button
            onPress={handleContinue}
            isDisabled={!termsAccepted}
            size="xl"
            borderRadius="$xl"
            bg={termsAccepted ? '$primary500' : '$coolGray400'}
            accessibilityRole="button"
            accessibilityLabel={t('consent.button.continue')}
            accessibilityState={{ disabled: !termsAccepted }}
            testID="continue-button"
          >
            <ButtonText fontWeight="$semibold">
              {t('consent.button.continue')}
            </ButtonText>
          </Button>
        </Box>
      </Box>
    </ScrollView>
  );
};
```

### i18n Translations

**Add to locale files** (en, es, ca, pl, tl):

```json
{
  "consent": {
    "header": {
      "welcome": "Your Privacy Matters",
      "updated": "We've Updated Our Policies"
    },
    "description": "We use analytics and crash reporting to improve the app. No personal data is sold or shared with advertisers.",
    "analytics": {
      "sectionTitle": "Analytics",
      "title": "Analytics & Diagnostics",
      "description": "Helps us fix crashes and understand how you use the app",
      "hint": "Toggle to enable or disable analytics and crash reporting"
    },
    "legal": {
      "sectionTitle": "Legal Documents"
    },
    "links": {
      "terms": "Terms & Conditions",
      "privacy": "Privacy Policy"
    },
    "accept": {
      "label": "I have read and accept the Terms and Privacy Policy"
    },
    "button": {
      "continue": "Continue"
    }
  }
}
```

---

## Files to Create

| File                                     | Purpose              |
| ---------------------------------------- | -------------------- |
| `src/features/Consent/ConsentScreen.tsx` | Consent UI component |
| `src/features/Consent/index.ts`          | Export barrel        |

## Files to Modify

| File                       | Changes                            |
| -------------------------- | ---------------------------------- |
| `src/i18n/locales/en.json` | Add consent translations           |
| `src/i18n/locales/es.json` | Add consent translations (Spanish) |
| `src/i18n/locales/ca.json` | Add consent translations (Catalan) |
| `src/i18n/locales/pl.json` | Add consent translations (Polish)  |
| `src/i18n/locales/tl.json` | Add consent translations (Tagalog) |

---

## Acceptance Criteria

**Design & UI**:

- [ ] iOS 26 grouped inset card style with `$2xl` border radius
- [ ] Dark/light mode support using `useAppColorScheme` hook
- [ ] Background colours: `$black`/`$coolGray100` (dark/light)
- [ ] Card colours: `$coolGray900`/`$white` (dark/light)
- [ ] Section headers: uppercase, `$xs` font, proper muted colours
- [ ] Lucide icons with coloured backgrounds (iOS settings style)
- [ ] Uses GlueStack UI components ONLY (no React Native primitives)
- [ ] NO `StyleSheet.create()` - all styling via GlueStack props

**Functionality**:

- [ ] "Analytics & Diagnostics" toggle defaults to OFF
- [ ] T&C and Privacy links navigate to respective screens
- [ ] Checkbox for accepting terms
- [ ] Continue button disabled until terms accepted
- [ ] Continue button calls dispatch and storage functions
- [ ] Services (Sentry, PostHog) initialised based on toggle

**Accessibility (EAA Compliance - WCAG 2.1 Level AA)**:

- [ ] Analytics Switch: `accessibilityRole="switch"`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState={{ checked }}`
- [ ] Terms Checkbox: `accessibilityRole="checkbox"`, `accessibilityLabel`, `accessibilityState={{ checked }}`
- [ ] Continue Button: `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityState={{ disabled }}`
- [ ] Legal Links: `accessibilityRole="link"`, `accessibilityLabel`
- [ ] Section Headers: `accessibilityRole="header"`
- [ ] All touch targets ≥ 44×44 points (iOS) / 48×48 dp (Android)
- [ ] Text contrast ≥ 4.5:1 (normal text) / 3:1 (large text)
- [ ] Decorative icons: `accessibilityElementsHidden={true}`
- [ ] Logical focus order (top-to-bottom)
- [ ] Screen testable with VoiceOver (iOS) and TalkBack (Android)

**Internationalisation & Testing**:

- [ ] i18n translations for all 5 languages
- [ ] `testID` props on all interactive elements
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Default State**

```gherkin
Given I open the ConsentScreen for the first time
Then the analytics toggle should be OFF
And the terms checkbox should be unchecked
And the Continue button should be disabled
```

**Scenario 2: Enable Continue**

```gherkin
Given I am on the ConsentScreen
When I check the terms acceptance checkbox
Then the Continue button should become enabled
```

**Scenario 3: Navigation to Terms**

```gherkin
Given I am on the ConsentScreen
When I tap the Terms & Conditions link
Then I should navigate to the TermsAndConditions screen
```

**Scenario 4: Complete Flow with Analytics**

```gherkin
Given I am on the ConsentScreen
When I toggle analytics ON
And I check the terms checkbox
And I tap Continue
Then analyticsEnabled should be saved as true
And Sentry should be initialised
And PostHog should be initialised
And I should proceed to the main app
```

---

## Dependencies

**Blocked By**: TASK-389, TASK-391, TASK-392

**Blocks**: TASK-394, TASK-396

---

## Notes

**EAA Compliance**:
All interactive elements must have:

- `accessibilityRole` (switch, checkbox, button, link)
- `accessibilityLabel` (descriptive label)
- `accessibilityState` (checked, disabled)
- `testID` for testing

**Re-consent Mode**:
When `needsReConsent` is true, the header changes to "We've Updated Our Policies" to inform users why they're seeing this screen again.

---

**Last Updated**: 2025-12-09
