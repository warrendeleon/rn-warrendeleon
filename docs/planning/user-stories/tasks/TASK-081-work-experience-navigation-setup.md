# TASK-081: Set up Work Experience Navigation Routes

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-019: Work Experience Navigation & Routing](../stories/US-019-work-experience-navigation.md)
**Status**: ⏳ In Progress
**Priority**: High
**Estimated Effort**: 1 hour
**Created**: 2025-11-16

---

## Context

Configure React Navigation routes for the work experience feature, including the main list screen, company details screen, and client listing screen. This task establishes the navigation hierarchy and ensures type-safe navigation with proper screen headers.

## Technical Details

### Navigation Configuration

**Location**: `src/navigation/RootNavigator.tsx`

Add the following screens to the stack navigator:

```typescript
import { WorkExperienceScreen } from '@app/features/WorkExperience/WorkExperienceScreen';
import { WorkExperienceDetailsScreen } from '@app/features/WorkExperience/WorkExperienceDetailsScreen';
import { WorkExperienceClientsScreen } from '@app/features/WorkExperience/WorkExperienceClientsScreen';

// Inside RootNavigator component:
<Stack.Screen
  name="WorkExperience"
  component={WorkExperienceScreen}
  options={{
    headerTitle: t('workExperience.screenTitle'),
    headerLargeTitle: true,
    headerBackTitle: t('common.back'),
  }}
/>

<Stack.Screen
  name="WorkExperienceDetails"
  component={WorkExperienceDetailsScreen}
  options={({ route }) => ({
    headerTitle: route.params.companyName,
    headerBackTitle: t('common.back'),
  })}
/>

<Stack.Screen
  name="WorkExperienceClients"
  component={WorkExperienceClientsScreen}
  options={({ route }) => ({
    headerTitle: route.params.companyName,
    headerBackTitle: t('common.back'),
  })}
/>
```

### Update Home Screen Navigation

**Location**: `src/screens/HomeScreen.tsx`

Update the Work Experience button to navigate to WorkExperience:

```typescript
<ButtonWithChevron
  label={t('home.workExperienceButton')}
  onPress={() => navigation.navigate('WorkExperience')}
  testID="home-work-experience-button"
  accessibilityLabel={t('home.workExperienceAccessibilityLabel')}
  accessibilityHint={t('home.workExperienceAccessibilityHint')}
/>
```

### Navigation Type Safety

**Location**: `src/types/navigation.ts`

Ensure RootStackParamList includes work experience routes (should already be defined in TASK-079):

```typescript
export type RootStackParamList = {
  // ... existing routes
  WorkExperience: undefined;
  WorkExperienceDetails: {
    workExperienceId: string;
    companyName: string;
  };
  WorkExperienceClients: {
    workExperienceId: string;
    companyName: string;
  };
};
```

### Placeholder Screens (if needed)

If WorkExperienceDetailsScreen and WorkExperienceClientsScreen don't exist yet, create placeholder components:

**Location**: `src/features/WorkExperience/WorkExperienceDetailsScreen.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@app/types/navigation';

type WorkExperienceDetailsRouteProp = RouteProp<RootStackParamList, 'WorkExperienceDetails'>;

export const WorkExperienceDetailsScreen = () => {
  const route = useRoute<WorkExperienceDetailsRouteProp>();
  const { workExperienceId, companyName } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Work Experience Details</Text>
      <Text>Company: {companyName}</Text>
      <Text>ID: {workExperienceId}</Text>
    </View>
  );
};
```

**Location**: `src/features/WorkExperience/WorkExperienceClientsScreen.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@app/types/navigation';

type WorkExperienceClientsRouteProp = RouteProp<RootStackParamList, 'WorkExperienceClients'>;

export const WorkExperienceClientsScreen = () => {
  const route = useRoute<WorkExperienceClientsRouteProp>();
  const { workExperienceId, companyName } = route.params;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Clients for {companyName}</Text>
      <Text>Work Experience ID: {workExperienceId}</Text>
    </View>
  );
};
```

### i18n Translation Keys

Add to all locale files:

```json
{
  "workExperience": {
    "screenTitle": "Work Experience",
    "detailsTitle": "Company Details",
    "clientsTitle": "Clients"
  },
  "home": {
    "workExperienceButton": "Work Experience",
    "workExperienceAccessibilityLabel": "View work experience",
    "workExperienceAccessibilityHint": "Navigate to work experience screen"
  },
  "common": {
    "back": "Back"
  }
}
```

### Files Affected

- `src/navigation/RootNavigator.tsx` - Add WorkExperience, WorkExperienceDetails, WorkExperienceClients routes
- `src/screens/HomeScreen.tsx` - Update Work Experience button navigation
- `src/types/navigation.ts` - Ensure routes typed (from TASK-079)
- `src/features/WorkExperience/WorkExperienceDetailsScreen.tsx` - New placeholder screen (if needed)
- `src/features/WorkExperience/WorkExperienceClientsScreen.tsx` - New placeholder screen (if needed)
- `src/locales/*/translation.json` - Add navigation translations (all 5 languages)

## Acceptance Criteria

- ✅ WorkExperience route added to RootNavigator
- ✅ WorkExperienceDetails route added with dynamic company name header
- ✅ WorkExperienceClients route added with dynamic company name header
- ✅ All routes are type-safe (TypeScript enforces correct params)
- ✅ Home screen Work Experience button navigates to WorkExperience
- ✅ Navigation params include workExperienceId and companyName
- ✅ Back button navigation works correctly
- ✅ Screen headers display correctly (static and dynamic)
- ✅ Placeholder screens render without errors
- ✅ All navigation text is internationalised
- ✅ No TypeScript errors in navigation code
- ✅ No console warnings when navigating

## Test Scenarios

### Scenario 1: Navigate from Home to Work Experience

**GIVEN** I am on the Home screen
**WHEN** I tap the "Work Experience" button
**THEN** I should navigate to WorkExperience screen
**AND** the header should say "Work Experience"

### Scenario 2: Navigate to company details

**GIVEN** I am on the WorkExperience screen
**WHEN** WorkExperienceScreen navigates to WorkExperienceDetails with params
**THEN** WorkExperienceDetails screen should render
**AND** the header should show the company name
**AND** the params should be accessible via useRoute

### Scenario 3: Navigate to clients

**GIVEN** I am on the WorkExperience screen
**WHEN** WorkExperienceScreen navigates to WorkExperienceClients with params
**THEN** WorkExperienceClients screen should render
**AND** the header should show the company name
**AND** the params should be accessible via useRoute

### Scenario 4: Back navigation

**GIVEN** I am on WorkExperienceDetails or WorkExperienceClients screen
**WHEN** I tap the back button
**THEN** I should return to WorkExperience screen

### Scenario 5: TypeScript type safety

**GIVEN** navigation routes are typed
**WHEN** calling navigation.navigate with incorrect params
**THEN** TypeScript should show an error
**AND** IDE autocomplete should suggest valid route names

## Dependencies

**Prerequisites**:

- ✅ TASK-079: Navigation types defined in RootStackParamList
- ✅ TASK-080: WorkExperienceScreen component created
- ✅ React Navigation v7 installed and configured

**Enables**:

- TASK-082: Unit Tests for WorkExperienceScreen
- TASK-083: E2E Tests for Work Experience Flow

## Success Criteria

- All navigation routes work correctly
- Type safety enforced throughout navigation code
- Dynamic headers display company names correctly
- Back navigation intuitive and functional
- No navigation errors or warnings
- Consistent with existing navigation patterns
- Internationalised navigation text

## Notes

- Follow Education screen navigation pattern from EPIC-009
- Placeholder screens can be enhanced in future iterations
- Consider adding navigation guards to validate params
- May need to pass logo URI to avoid re-fetching in detail screens
- Ensure proper TypeScript types for useNavigation and useRoute hooks
- Test navigation on both iOS and Android for platform differences
- Large title headers should collapse on scroll (iOS)
