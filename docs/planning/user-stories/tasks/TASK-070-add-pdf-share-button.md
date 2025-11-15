# TASK-070: Add Share Button to PDF Header

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**User Story**: [US-015: CV PDF Viewer](../stories/US-015-cv-pdf-viewer.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 1 hour
**Created**: 2025-11-15

---

## Context

Add a share button to the PDF screen's header that allows users to share the CV via the native share sheet (messaging, email, AirDrop, etc.).

## Technical Details

### Install Dependencies

```bash
yarn add react-native-share
cd ios && pod install && cd ..
```

### Implementation

**File**: `src/features/PDF/PDFScreen.tsx`

```typescript
import React, { useCallback } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';

import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/hooks';

type PDFScreenRouteProp = RouteProp<RootStackParamList, 'PDF'>;

export const PDFScreen = () => {
  const route = useRoute<PDFScreenRouteProp>();
  const navigation = useNavigation();
  const colorScheme = useAppColorScheme();

  const handleShare = useCallback(async () => {
    try {
      await Share.open({
        url: route.params.uri,
        type: 'application/pdf',
        title: 'Share CV',
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share CV');
      }
    }
  }, [route.params.uri]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Share2
          size={24}
          color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
          onPress={handleShare}
          style={{ marginRight: 16 }}
        />
      ),
    });
  }, [navigation, handleShare, colorScheme]);

  return (
    <Pdf
      source={{ uri: route.params.uri, cache: true }}
      style={styles.pdf}
      trustAllCerts={false}
    />
  );
};

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
```

### Files Affected

- `package.json` - Add react-native-share
- `yarn.lock` - Lock versions
- `ios/Podfile.lock` - iOS dependencies
- `src/features/PDF/PDFScreen.tsx` - Add share functionality

## Acceptance Criteria

- ✅ react-native-share library installed
- ✅ Share button appears in header right
- ✅ Share button uses lucide-react-native Share2 icon
- ✅ Share button color matches theme (dark/light)
- ✅ Tapping share button opens native share sheet
- ✅ Share sheet includes PDF URL
- ✅ Error handling for failed shares
- ✅ No error shown if user cancels share

## Test Scenarios

### Scenario 1: Share button visible

**GIVEN** I am viewing the PDF screen
**WHEN** the screen renders
**THEN** I should see a share icon in the header right
**AND** the icon color should match the theme

### Scenario 2: Share sheet opens

**GIVEN** I am viewing the PDF screen
**WHEN** I tap the share button
**THEN** the native share sheet should open
**AND** I should see sharing options (Messages, Mail, etc.)

### Scenario 3: User cancels share

**GIVEN** the share sheet is open
**WHEN** I tap "Cancel" or close the sheet
**THEN** the sheet should close
**AND** no error should be shown

### Scenario 4: Share succeeds

**GIVEN** the share sheet is open
**WHEN** I select a share method and complete it
**THEN** the CV should be shared successfully
**AND** the sheet should close

## Dependencies

**Prerequisites**:

- ✅ TASK-068: Create PDFScreen Component
- ✅ TASK-069: Add PDF Navigation Route

**Enables**:

- TASK-072: E2E Tests for PDF Viewer Flow

## Success Criteria

- Share button integrated in PDF screen header
- Native share sheet works on iOS and Android
- Professional UX with proper error handling
- Icon color adapts to theme

## Notes

- react-native-share handles platform differences automatically
- Share2 icon from lucide-react-native matches app's icon system
- Error message only shown for actual errors, not user cancellation
- Share URL (not file) for simplicity - download feature can be added later
