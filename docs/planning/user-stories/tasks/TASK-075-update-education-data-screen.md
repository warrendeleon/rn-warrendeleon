# TASK-075: Update EducationDataScreen UI

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**User Story**: [US-016: Education Screen with SVG Logos](../stories/US-016-education-screen-svg-logos.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 1.25 hours
**Created**: 2025-11-15

---

## Context

Update the EducationDataScreen from displaying raw JSON data to using the MenuButtonGroupSvg component for a professional, logo-based presentation. Map education data from Redux to component props and add proper empty state handling.

## Technical Details

### Current Implementation

**File**: `src/features/Education/EducationDataScreen.tsx`

Currently displays:

- JSON.stringify(education) for debugging
- Basic loading/error states
- No visual design or logos

### Updated Implementation

```typescript
import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MenuButtonGroupSvg, type MenuButtonGroupSvgItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppDispatch, useAppSelector } from '@app/store';

import { fetchEducation } from './store/actions';
import { selectEducation, selectEducationError, selectEducationLoading } from './store/selectors';

type EducationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EducationData'>;

// Map logo filename from API to local SVG asset
const getLogoUri = (logoFilename: string): string => {
  // Remove extension if present
  const baseName = logoFilename.replace(/\.(svg|png|jpg)$/i, '');

  // Map to local SVG file path
  // Example: "stucom.svg" -> require path
  return `file:///android_asset/logos/education/${baseName}.svg`;
};

// Format date range
const formatDateRange = (start: string, end?: string): string => {
  const startYear = new Date(start).getFullYear();
  const endYear = end ? new Date(end).getFullYear() : 'Present';
  return `${startYear} - ${endYear}`;
};

export const EducationDataScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<EducationScreenNavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const education = useAppSelector(selectEducation);
  const loading = useAppSelector(selectEducationLoading);
  const error = useAppSelector(selectEducationError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchEducation());
  }, [dispatch, language]);

  const handleEducationPress = useCallback(
    (certificateUrl?: string) => {
      if (certificateUrl) {
        navigation.navigate('WebView', {
          uri: certificateUrl,
          title: 'Certificate',
        });
      }
    },
    [navigation]
  );

  const educationItems: MenuButtonGroupSvgItem[] = useMemo(() => {
    if (!education) return [];

    return education.map(item => ({
      id: `${item.location}-${item.title}`,
      label: item.title,
      subtitle: `${item.location} • ${formatDateRange(item.start, item.end)}`,
      logoUri: getLogoUri(item.logo),
      onPress: item.certificate
        ? () => handleEducationPress(item.certificate)
        : undefined,
      testID: `education-item-${item.location.toLowerCase().replace(/\s+/g, '-')}`,
      showChevron: !!item.certificate,
    }));
  }, [education, handleEducationPress]);

  return (
    <ScrollView
      testID="education-data-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <MenuButtonGroupSvg
        items={educationItems}
        loading={loading}
        error={error || undefined}
      />

      {!loading && !error && educationItems.length === 0 && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            No education data available
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
```

### Helper Functions

**Logo Mapping**: Convert API logo filename to local SVG asset path

- Input: `"stucom.svg"` or `"stucom"`
- Output: Local file path or require() reference

**Date Formatting**: Convert ISO date strings to readable range

- Input: `start: "2010-09-01"`, `end: "2014-06-30"`
- Output: `"2010 - 2014"`

**Certificate Detection**: Show chevron only when certificate exists

- Check `Education.certificate` field
- Only add onPress handler if certificate URL exists

### Files Affected

- `src/features/Education/EducationDataScreen.tsx` - Complete UI overhaul

## Acceptance Criteria

- ✅ EducationDataScreen uses MenuButtonGroupSvg
- ✅ Education data mapped to MenuButtonGroupSvgItem[]
- ✅ SVG logos display for each education entry
- ✅ Title and location displayed correctly
- ✅ Date range formatted and displayed
- ✅ Certificate entries show chevron and are tappable
- ✅ Non-certificate entries have no chevron and are not tappable
- ✅ Loading state passed to MenuButtonGroupSvg
- ✅ Error state passed to MenuButtonGroupSvg
- ✅ Empty state displays when no data
- ✅ Dark mode fully supported

## Test Scenarios

### Scenario 1: Display education list

**GIVEN** education data is loaded
**WHEN** the screen renders
**THEN** I should see MenuButtonGroupSvg with education items
**AND** each item should show logo, title, location, and dates
**AND** items with certificates should show chevron

### Scenario 2: Navigate to certificate

**GIVEN** an education entry has a certificate
**WHEN** I tap that entry
**THEN** I should navigate to WebView
**AND** the certificate URL should load

### Scenario 3: Non-certificate entry

**GIVEN** an education entry has no certificate
**WHEN** I tap that entry
**THEN** nothing should happen (not tappable)
**AND** no chevron should be visible

### Scenario 4: Loading state

**GIVEN** education data is loading
**WHEN** the screen renders
**THEN** I should see a loading indicator
**AND** no education items visible

### Scenario 5: Error state

**GIVEN** education data fetch fails
**WHEN** the screen renders
**THEN** I should see an error message
**AND** no education items visible

### Scenario 6: Empty state

**GIVEN** no education data exists
**WHEN** the screen renders
**THEN** I should see "No education data available"
**AND** no education items visible

## Dependencies

**Prerequisites**:

- ✅ TASK-073: SVG logo assets downloaded
- ✅ TASK-074: MenuButtonGroupSvg component created
- ✅ Education Redux slice exists
- ✅ Education API integration exists

**Enables**:

- TASK-076: Add Certificate WebView Navigation
- TASK-077: Unit Tests for Education Screen
- TASK-078: E2E Tests for Education Screen Flow

## Success Criteria

- Education screen displays professional logo-based list
- All education data properly mapped to UI
- Certificate navigation ready for TASK-076
- Loading, error, and empty states handled
- Dark mode support complete
- Screen ready for testing tasks

## Notes

- Logo URI mapping may need adjustment based on asset structure
- Date formatting assumes ISO 8601 format from API
- Empty state needed for edge case handling
- Subtitle format: "Location • Date Range" (iOS standard)
- Consider adding pull-to-refresh in future iteration
- testID pattern: `education-item-{location-slug}`
