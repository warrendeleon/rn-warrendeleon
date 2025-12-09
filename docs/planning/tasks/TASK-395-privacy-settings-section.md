# TASK-395: Privacy Settings Section

**Task ID**: TASK-395
**Title**: Privacy Settings Section
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-073: Privacy Settings & Re-consent Flow](../stories/US-073-privacy-settings-reconsent.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: UI Component

---

## Overview

Add a "Privacy" section to the SettingsScreen that allows users to toggle analytics and view legal documents. Changes here should immediately enable/disable Sentry and PostHog.

**Design Requirements**:

- Follows existing SettingsScreen patterns exactly
- Uses existing `SettingsGroup` and `SettingsGroupItem` pattern
- iOS 26 grouped inset card style (already in SettingsGroup)
- Lucide icons with coloured backgrounds
- GlueStack UI components ONLY

---

## Technical Details

### Design Pattern

This task uses the **existing SettingsGroup pattern** from SettingsScreen.tsx:

- Section header: uppercase, `$xs` font, muted colour
- `SettingsGroup` component with `items` array
- Each item has `startIcon`, `startIconBgColor`, `label`, `onPress`, `testID`

### Implementation

**Update `src/features/Settings/SettingsScreen.tsx`**:

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { Switch } from '@gluestack-ui/themed';
import { ChartBar, FileText, Shield } from 'lucide-react-native';

import { selectAnalyticsEnabled } from '@app/features/Consent/store/selectors';
import { setAnalyticsEnabled } from '@app/features/Consent/store/reducer';
import { saveConsentToStorage } from '@app/features/Consent/storage/consentStorage';
import { initSentry, shutdownSentry } from '@app/config/sentry';
import { initPostHog, shutdownPostHog } from '@app/config/posthog';

// Inside SettingsScreen component
const analyticsEnabled = useAppSelector(selectAnalyticsEnabled);
const dispatch = useDispatch();

const handleAnalyticsToggle = useCallback(async (enabled: boolean) => {
  // Update Redux state
  dispatch(setAnalyticsEnabled(enabled));

  // Update local storage
  await saveConsentToStorage({ analyticsEnabled: enabled });

  // Enable/disable services immediately
  if (enabled) {
    await initSentry(true);
    await initPostHog(true);
  } else {
    shutdownSentry();
    await shutdownPostHog();
  }

  // TODO: Sync to Supabase when logged in
}, [dispatch]);

const handleTermsPress = useCallback(() => {
  navigation.navigate('TermsAndConditions');
}, [navigation]);

const handlePrivacyPress = useCallback(() => {
  navigation.navigate('PrivacyPolicy');
}, [navigation]);

// Privacy settings items - follows existing SettingsGroupItem pattern
const privacyItems: SettingsGroupItem[] = useMemo(
  () => [
    {
      label: t('settings.privacy.terms'),
      onPress: handleTermsPress,
      startIcon: FileText,
      startIconBgColor: '$orange500',
      testID: 'settings-terms-link',
      showChevron: true,
    },
    {
      label: t('settings.privacy.privacyPolicy'),
      onPress: handlePrivacyPress,
      startIcon: Shield,
      startIconBgColor: '$green500',
      testID: 'settings-privacy-link',
      showChevron: true,
    },
  ],
  [t, handleTermsPress, handlePrivacyPress]
);

// In the JSX, add Privacy section after General section:
{/* Privacy Section */}
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
    {t('settings.privacy.title')}
  </Text>

  {/* Analytics Toggle - Custom row with Switch */}
  <Box
    bg={isDark ? '$coolGray900' : '$white'}
    borderRadius="$2xl"
    overflow="hidden"
    mb="$3"
  >
    <HStack
      justifyContent="space-between"
      alignItems="center"
      p="$4"
    >
      <HStack space="md" alignItems="center" flex={1}>
        <Box bg="$blue500" p="$2" borderRadius="$lg">
          <ChartBar size={20} color="#FFFFFF" accessibilityElementsHidden />
        </Box>
        <VStack flex={1}>
          <Text fontWeight="$medium" color={isDark ? '$white' : '$black'}>
            {t('settings.privacy.analytics.title')}
          </Text>
          <Text fontSize="$xs" color={isDark ? '$textDark400' : '$textLight600'}>
            {t('settings.privacy.analytics.description')}
          </Text>
        </VStack>
      </HStack>
      <Switch
        value={analyticsEnabled}
        onValueChange={handleAnalyticsToggle}
        accessibilityRole="switch"
        accessibilityLabel={t('settings.privacy.analytics.title')}
        accessibilityHint={t('settings.privacy.analytics.hint')}
        accessibilityState={{ checked: analyticsEnabled }}
        testID="settings-analytics-toggle"
      />
    </HStack>
  </Box>

  {/* Legal Links - Uses standard SettingsGroup */}
  <SettingsGroup items={privacyItems} />
</Box>
```

### i18n Translations

**Add to locale files**:

```json
{
  "settings": {
    "privacy": {
      "title": "Privacy",
      "analytics": {
        "title": "Analytics & Diagnostics",
        "description": "Help improve the app by sharing anonymous usage data",
        "hint": "Toggle to enable or disable analytics"
      },
      "terms": "Terms & Conditions",
      "privacyPolicy": "Privacy Policy"
    }
  }
}
```

---

## Files to Modify

| File                                       | Changes                           |
| ------------------------------------------ | --------------------------------- |
| `src/features/Settings/SettingsScreen.tsx` | Add Privacy section               |
| `src/i18n/locales/en.json`                 | Add privacy settings translations |
| `src/i18n/locales/es.json`                 | Add privacy settings translations |
| `src/i18n/locales/ca.json`                 | Add privacy settings translations |
| `src/i18n/locales/pl.json`                 | Add privacy settings translations |
| `src/i18n/locales/tl.json`                 | Add privacy settings translations |

---

## Acceptance Criteria

**Design & UI**:

- [ ] Follows existing SettingsScreen section pattern exactly
- [ ] Uses `SettingsGroup` for legal document links
- [ ] Analytics toggle card matches iOS 26 grouped style
- [ ] Section header: uppercase, `$xs` font, muted colour
- [ ] Lucide icons with coloured backgrounds
- [ ] Dark/light mode support using existing `isDark` pattern
- [ ] GlueStack UI components ONLY (no React Native primitives)
- [ ] NO `StyleSheet.create()` - all styling via GlueStack props

**Functionality**:

- [ ] "Privacy" section added to SettingsScreen (after General)
- [ ] Analytics toggle shows current consent state from Redux
- [ ] Toggle immediately enables/disables Sentry + PostHog
- [ ] Toggle updates Redux and EncryptedStore
- [ ] Links to T&C and Privacy Policy navigate correctly

**Accessibility (EAA Compliance - WCAG 2.1 Level AA)**:

- [ ] Analytics Switch: `accessibilityRole="switch"`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState={{ checked }}`
- [ ] Legal Links: `accessibilityRole="link"`, `accessibilityLabel` (via SettingsGroup)
- [ ] Section Header: `accessibilityRole="header"`
- [ ] All touch targets ≥ 44×44 points (iOS) / 48×48 dp (Android)
- [ ] Text contrast ≥ 4.5:1 (normal text) / 3:1 (large text)
- [ ] Decorative icons: `accessibilityElementsHidden={true}`
- [ ] Logical focus order (top-to-bottom within Privacy section)
- [ ] Screen testable with VoiceOver (iOS) and TalkBack (Android)

**Internationalisation & Testing**:

- [ ] i18n translations for all 5 languages
- [ ] `testID` props on all interactive elements
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: View Privacy Settings**

```gherkin
Given I am on the Settings screen
Then I should see a "Privacy" section
And I should see an "Analytics & Diagnostics" toggle
And I should see links to Terms and Privacy Policy
```

**Scenario 2: Toggle Analytics ON**

```gherkin
Given analytics is currently OFF
When I toggle analytics ON in Settings
Then analytics services should be initialised
And the toggle should show ON state
And the preference should be saved to storage
```

**Scenario 3: Toggle Analytics OFF**

```gherkin
Given analytics is currently ON
When I toggle analytics OFF in Settings
Then PostHog should be shut down
And the toggle should show OFF state
And the preference should be saved to storage
```

**Scenario 4: Navigate to Legal Documents**

```gherkin
Given I am on the Settings screen
When I tap "Terms & Conditions"
Then I should navigate to the Terms screen
And I should be able to go back to Settings
```

---

## Dependencies

**Blocked By**: TASK-389, TASK-391, TASK-384

**Blocks**: TASK-396

---

## Notes

**Immediate Effect**:
Unlike the initial ConsentScreen (which only affects future sessions), the Settings toggle has immediate effect. When users turn off analytics, tracking stops right away.

**Service Shutdown**:

- PostHog: Full shutdown (`posthog.shutdown()`)
- Sentry: Can either shutdown or disable sending (depends on desired behaviour for crash reporting)

**Section Order**:
Consider placing the Privacy section after the main settings but before any "About" or "Support" sections.

---

**Last Updated**: 2025-12-09
