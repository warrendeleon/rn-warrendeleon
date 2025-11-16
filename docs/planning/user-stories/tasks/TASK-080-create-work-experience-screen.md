# TASK-080: Create WorkExperienceScreen Component

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-017: Work Experience Screen with Company Logos](../stories/US-017-work-experience-screen-display.md)
**Status**: ✅ Completed
**Priority**: High
**Estimated Effort**: 2 hours
**Created**: 2025-11-16
**Completed**: 2025-11-16

---

## Context

Create the WorkExperienceScreen component that displays a list of work experiences with company logos, position titles, employment dates, and client count badges. This screen serves as the main entry point for exploring work history and leverages the MenuButtonGroupSvg component from the Education feature.

## Technical Details

### Component Structure

**Location**: `src/features/WorkExperience/WorkExperienceScreen.tsx`

```typescript
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { MenuButtonGroupSvg, type MenuButtonGroupSvgItem } from '@app/components';
import { fetchWorkExperience } from './store/actions';
import {
  selectWorkExperience,
  selectWorkExperienceLoading,
  selectWorkExperienceError,
} from './store/selectors';
import type { WorkExperience } from '@app/types/portfolio';
import type { RootStackNavigationProp } from '@app/types/navigation';

export const WorkExperienceScreen = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const dispatch = useDispatch();

  const workExperience = useSelector(selectWorkExperience);
  const loading = useSelector(selectWorkExperienceLoading);
  const error = useSelector(selectWorkExperienceError);

  // Fetch work experience data on mount
  useEffect(() => {
    dispatch(fetchWorkExperience());
  }, [dispatch]);

  // Map work experience data to MenuButtonGroupSvg items
  const workExperienceItems: MenuButtonGroupSvgItem[] = useMemo(() => {
    if (!workExperience) return [];

    return workExperience.map((item: WorkExperience) => {
      const hasClients = item.clients && item.clients.length > 0;
      const clientCount = item.clients?.length || 0;

      // Format employment dates
      const startYear = new Date(item.start).getFullYear();
      const endYear = item.end ? new Date(item.end).getFullYear() : t('common.present');
      const dateRange = `${startYear} - ${endYear}`;

      return {
        id: item.id,
        label: item.position,
        subtitle: `${item.company} • ${dateRange}`,
        logoUri: item.logo, // SVG URI from API
        badge: hasClients ? clientCount.toString() : undefined,
        onPress: () => {
          if (hasClients) {
            // Navigate to client listing screen
            navigation.navigate('WorkExperienceClients', {
              workExperienceId: item.id,
              companyName: item.company,
            });
          } else {
            // Navigate to company details screen
            navigation.navigate('WorkExperienceDetails', {
              workExperienceId: item.id,
              companyName: item.company,
            });
          }
        },
        testID: `work-experience-item-${item.company.toLowerCase().replace(/\s+/g, '-')}`,
        accessibilityLabel: t('workExperience.itemAccessibilityLabel', {
          position: item.position,
          company: item.company,
          start: startYear,
          end: endYear,
        }),
        accessibilityHint: hasClients
          ? t('workExperience.clientsAccessibilityHint', { count: clientCount })
          : t('workExperience.detailsAccessibilityHint'),
        accessibilityRole: 'button',
      };
    });
  }, [workExperience, navigation, t]);

  return (
    <View
      style={{ flex: 1 }}
      testID="work-experience-screen"
      accessibilityLabel={t('workExperience.screenTitle')}
    >
      <MenuButtonGroupSvg items={workExperienceItems} loading={loading} error={error} />
    </View>
  );
});

WorkExperienceScreen.displayName = 'WorkExperienceScreen';
```

### i18n Translation Keys

Add to `src/locales/en/translation.json`:

```json
{
  "workExperience": {
    "screenTitle": "Work Experience",
    "itemAccessibilityLabel": "{{position}} at {{company}}, {{start}} to {{end}}",
    "clientsAccessibilityHint": "Tap to view {{count}} clients",
    "detailsAccessibilityHint": "Tap to view company details",
    "loadingMessage": "Loading work experience...",
    "errorMessage": "Failed to load work experience. Please try again.",
    "emptyMessage": "No work experience data available"
  },
  "common": {
    "present": "Present"
  }
}
```

### Files Affected

- `src/features/WorkExperience/WorkExperienceScreen.tsx` - New component
- `src/locales/en/translation.json` - Add work experience translations
- `src/locales/es/translation.json` - Add Spanish translations
- `src/locales/ca/translation.json` - Add Catalan translations
- `src/locales/pl/translation.json` - Add Polish translations
- `src/locales/tl/translation.json` - Add Tagalog translations

## Acceptance Criteria

- ✅ WorkExperienceScreen component created in feature-first structure
- ✅ Integrates with work experience Redux slice
- ✅ Uses MenuButtonGroupSvg component for rendering
- ✅ Maps work experience data to MenuButtonGroupSvgItem format
- ✅ Displays company logo, position title, employment dates
- ✅ Shows client count badge for multi-client positions
- ✅ Navigates to WorkExperienceClients screen when item has clients
- ✅ Navigates to WorkExperienceDetails screen when item has no clients
- ✅ Handles loading state (shows loading indicator)
- ✅ Handles error state (shows error message)
- ✅ Handles empty state (shows empty message)
- ✅ All text internationalised with i18next
- ✅ EAA accessibility compliance (labels, hints, roles)
- ✅ Component memoized with React.memo
- ✅ Data transformations memoized with useMemo
- ✅ testID added for E2E testing
- ✅ TypeScript strict mode compliance
- ✅ Dark mode support (inherited from MenuButtonGroupSvg)

## Test Scenarios

### Scenario 1: Display work experience list

**GIVEN** work experience data is loaded
**WHEN** WorkExperienceScreen renders
**THEN** all work experiences should be displayed
**AND** each item should show logo, position, company, date range
**AND** items should be ordered by start date (newest first)

### Scenario 2: Navigate to client listing

**GIVEN** work experience item has 3 clients
**WHEN** user taps the item
**THEN** navigation should occur to WorkExperienceClients screen
**AND** params should include workExperienceId and companyName

### Scenario 3: Navigate to company details

**GIVEN** work experience item has no clients
**WHEN** user taps the item
**THEN** navigation should occur to WorkExperienceDetails screen
**AND** params should include workExperienceId and companyName

### Scenario 4: Handle loading state

**GIVEN** work experience is being fetched
**WHEN** WorkExperienceScreen renders
**THEN** loading indicator should be visible
**AND** no items should be displayed yet

### Scenario 5: Handle error state

**GIVEN** work experience fetch failed
**WHEN** WorkExperienceScreen renders
**THEN** error message should be displayed
**AND** error message should be user-friendly

### Scenario 6: Handle empty state

**GIVEN** no work experience data exists
**WHEN** WorkExperienceScreen renders
**THEN** empty state message should be displayed

## Dependencies

**Prerequisites**:

- ✅ TASK-079: Work Experience TypeScript types defined
- ✅ TASK-074: MenuButtonGroupSvg component created (EPIC-009)
- ✅ TASK-085: Work Experience Redux slice implemented
- ✅ React Navigation configured

**Enables**:

- TASK-081: Set up Work Experience Navigation Routes
- TASK-082: Unit Tests for WorkExperienceScreen

## Success Criteria

- Component renders correctly with real data
- Navigation flows work smoothly
- Loading/error/empty states handled gracefully
- Accessibility fully compliant (WCAG 2.1 AA)
- Performance optimised (memoization)
- Code quality: zero TypeScript errors, zero lint warnings
- Matches Education screen UX quality

## Notes

- Reuse MenuButtonGroupSvg from Education feature for consistency
- Client count badge should be visually distinct but not distracting
- Date formatting should respect user locale (via i18next)
- "Present" text should be translatable for current positions
- Consider adding skeleton loading animation in future iteration
- Logo URIs come from API (remote SVG files or local assets)
- Follow same error handling pattern as Education screen
- Ensure proper cleanup in useEffect if needed
