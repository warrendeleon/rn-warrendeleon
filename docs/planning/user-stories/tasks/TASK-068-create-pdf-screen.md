# TASK-068: Create PDFScreen Component

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**User Story**: [US-015: CV PDF Viewer](../stories/US-015-cv-pdf-viewer.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 1 hour
**Created**: 2025-11-15

---

## Context

Create a reusable PDFScreen component that displays PDF documents from a URL. This component will be used to view the CV and can be extended for other documents in the future.

## Technical Details

### Component Structure

```
src/features/PDF/
├── PDFScreen.tsx
├── index.ts
└── __tests__/
    └── PDFScreen.rntl.tsx (created in TASK-071)
```

### Implementation

**File**: `src/features/PDF/PDFScreen.tsx`

```typescript
import React from 'react';
import { StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import { type RouteProp, useRoute } from '@react-navigation/native';

import type { RootStackParamList } from '@app/navigation';

type PDFScreenRouteProp = RouteProp<RootStackParamList, 'PDF'>;

export const PDFScreen = () => {
  const route = useRoute<PDFScreenRouteProp>();

  return (
    <Pdf
      source={{ uri: route.params.uri, cache: true }}
      style={styles.pdf}
      trustAllCerts={false}
      onLoadComplete={(numberOfPages) => {
        console.log(`PDF loaded: ${numberOfPages} pages`);
      }}
      onError={(error) => {
        console.error('PDF load error:', error);
      }}
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

**File**: `src/features/PDF/index.ts`

```typescript
export { PDFScreen } from './PDFScreen';
```

### Files Affected

- `src/features/PDF/PDFScreen.tsx` (new)
- `src/features/PDF/index.ts` (new)
- `src/features/index.ts` (update to export PDF)

### Features Included

- **URL Loading**: Load PDF from remote URL with caching
- **Type Safety**: TypeScript types for route params
- **Error Handling**: onError callback for failed loads
- **Loading Complete**: onLoadComplete callback for tracking
- **Security**: trustAllCerts=false for HTTPS validation
- **Responsive**: flex layout fills entire screen

## Acceptance Criteria

- ✅ PDFScreen component created in src/features/PDF/
- ✅ Component accepts URI via route params
- ✅ PDF renders full screen with proper layout
- ✅ Cache enabled for offline viewing
- ✅ Error and load complete handlers implemented
- ✅ TypeScript types defined for route params
- ✅ Component exported from src/features/index.ts

## Test Scenarios

### Scenario 1: Component renders PDF

**GIVEN** PDFScreen receives a valid PDF URI
**WHEN** the component mounts
**THEN** it should render the Pdf component
**AND** pass the URI to the source prop
**AND** enable caching

### Scenario 2: Type safety

**GIVEN** navigation to PDF screen
**WHEN** params are typed incorrectly
**THEN** TypeScript should show an error
**AND** prevent compilation

## Dependencies

**Prerequisites**:

- ✅ TASK-067: Install react-native-pdf

**Enables**:

- TASK-069: Add PDF Navigation Route
- TASK-071: Unit Tests for PDFScreen

## Success Criteria

- PDFScreen component successfully renders PDF from URL
- Component follows feature-first architecture pattern
- Type-safe route params prevent runtime errors
- Ready for integration with navigation

## Notes

- Using StyleSheet instead of inline styles for performance
- Cache enabled by default for better UX
- No dark mode handling yet (will be added in future)
- Loading and error UI states will be enhanced later
