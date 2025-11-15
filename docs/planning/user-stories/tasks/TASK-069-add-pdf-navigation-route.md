# TASK-069: Add PDF Route to Navigation

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**User Story**: [US-015: CV PDF Viewer](../stories/US-015-cv-pdf-viewer.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 0.5 hours
**Created**: 2025-11-15

---

## Context

Add PDF screen to React Navigation stack and connect the "My CV" button on HomeScreen to navigate to the PDF viewer with the CV URL.

## Technical Details

### Navigation Updates

**File**: `src/navigation/RootNavigator/RootNavigator.tsx`

```typescript
// Add to imports
import { PDFScreen } from '@app/features';

// Add to RootStackParamList
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Language: undefined;
  Appearance: undefined;
  ProfileData: undefined;
  WorkXPData: undefined;
  EducationData: undefined;
  WebView: { uri: string };
  PDF: { uri: string; title?: string }; // NEW
};

// Add to Stack.Navigator
<Stack.Screen
  name="PDF"
  component={PDFScreen}
  options={{ title: 'CV' }}
/>
```

### HomeScreen Integration

**File**: `src/features/Home/HomeScreen.tsx`

```typescript
// Add CV handler (export for testing)
export const handleCVPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('PDF', {
    uri: 'https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf',
    title: 'CV'
  });
};

// Update useCallback hook
const handleCV = useCallback(() => {
  handleCVPress(navigation);
}, [navigation]);

// Connect to My CV button
<ButtonWithChevron
  label={t('home.buttons.cv')}
  onPress={handleCV}
  icon={<FileText size={24} color={iconColor} />}
  variant={getButtonGroupVariant(1, 4)}
/>
```

### Files Affected

- `src/navigation/RootNavigator/RootNavigator.tsx` - Add PDF route
- `src/features/Home/HomeScreen.tsx` - Add CV handler
- `src/features/Home/__tests__/HomeScreen.rntl.tsx` - Update tests
- `src/features/index.ts` - Export PDFScreen

## Acceptance Criteria

- ✅ PDF route added to RootStackParamList with uri and title params
- ✅ PDFScreen registered in Stack.Navigator
- ✅ handleCVPress function created and exported
- ✅ My CV button navigates to PDF screen
- ✅ CV URL passed correctly to PDFScreen
- ✅ TypeScript compilation succeeds
- ✅ Navigation tests updated

## Test Scenarios

### Scenario 1: Navigation from HomeScreen

**GIVEN** I am on the HomeScreen
**WHEN** I tap the "My CV" button
**THEN** I should navigate to the PDF screen
**AND** the CV URL should be passed as a parameter
**AND** the header title should be "CV"

### Scenario 2: Type safety

**GIVEN** I try to navigate to PDF without uri param
**WHEN** TypeScript checks the code
**THEN** a compilation error should occur
**AND** prevent the build

### Scenario 3: Handler function exported

**GIVEN** HomeScreen component
**WHEN** tests import handleCVPress
**THEN** the function should be available
**AND** testable independently

## Dependencies

**Prerequisites**:

- ✅ TASK-068: Create PDFScreen Component
- ✅ HomeScreen with My CV button exists

**Enables**:

- TASK-070: Add Share Button to PDF Header
- TASK-072: E2E Tests for PDF Viewer Flow

## Success Criteria

- Tapping "My CV" button navigates to PDF screen
- CV loads correctly from URL
- Navigation is type-safe
- Tests updated to cover new navigation

## Notes

- CV URL: https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf
- Using same pattern as WebView navigation (handleGitHubPress)
- Title param optional for future flexibility
