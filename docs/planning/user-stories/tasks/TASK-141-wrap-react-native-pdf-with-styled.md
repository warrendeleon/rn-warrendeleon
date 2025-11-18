# TASK-141: Wrap react-native-pdf with styled() for Consistency

**Task ID**: TASK-141
**Epic**: [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-027](../stories/US-027-code-quality-tech-debt.md)
**Status**: 📋 Not Started
**Priority**: 🟢 Low
**Effort**: 2 hours

## Context

PDFScreen currently uses `react-native-pdf` component directly with `StyleSheet.create()` for styling. To maintain consistency with the GlueStack UI ecosystem and enable token-based inline styling, wrap the PDF component using the `styled()` function.

**Benefits**:

- Consistent inline prop styling across codebase
- Token system support ($full, $4, $white, etc.)
- Better DevTools component names
- Follows design system patterns

**Related**: See `.claude/docs/react-patterns.md` for the `styled()` wrapper pattern and examples.

## Technical Details

### Current Implementation

**File**: `src/features/PDF/PDFScreen.tsx`

**Current code** (lines 128-130, 131-166):

```typescript
import Pdf from 'react-native-pdf';
import {StyleSheet} from 'react-native';

// Component usage
return <Pdf source={{uri: url, cache: true}} style={styles.pdf} trustAllCerts={false} />;

// StyleSheet
const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#FFFFFF',
  },
  // ... other styles
});
```

### Target Implementation

**Step 1**: Create StyledPDF wrapper

```typescript
import { styled } from '@gluestack-style/react';
import Pdf from 'react-native-pdf';

const StyledPDF = styled(Pdf, {
  componentName: 'StyledPDF',
  // resolveProps can be added if needed for specific props
});
```

**Step 2**: Update PDFScreen component

```typescript
import {Box, Text, Spinner} from '@gluestack-ui/themed';
import {StyledPDF} from './StyledPDF'; // or inline in same file

export const PDFScreen = () => {
  const {url, isLoading} = usePDFScreen();

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <StyledPDF
      w="$full"
      h="$full"
      source={{uri: url, cache: true}}
      trustAllCerts={false}
    />
  );
};
```

**Step 3**: Remove StyleSheet.create for PDF styles (keep for other RN components if needed)

### Migration Steps

1. **Create StyledPDF wrapper** (30min)
   - Add `styled()` import from `@gluestack-style/react`
   - Create StyledPDF component with default styles
   - Add componentName for DevTools

2. **Update PDFScreen component** (30min)
   - Replace `Pdf` with `StyledPDF`
   - Convert StyleSheet styles to inline props
   - Replace hardcoded dimensions with `$full` tokens
   - Replace hardcoded colors with GlueStack tokens

3. **Clean up StyleSheet** (15min)
   - Remove `pdf` style from StyleSheet.create
   - Keep other styles for RN components (buttons, containers, etc.)
   - Update imports if StyleSheet is no longer needed

4. **Testing** (45min)
   - Visual regression check (compare PDF rendering)
   - Test PDF loading, scrolling, zooming
   - Test share button functionality
   - Run unit tests: `yarn test PDFScreen`
   - Run E2E tests: `yarn detox:ios:test -f "PDF"`
   - Run full validation: `yarn validate`

## Acceptance Criteria

### Implementation

- [ ] StyledPDF wrapper created using `styled()` from `@gluestack-style/react`
- [ ] `componentName: 'StyledPDF'` added for better DevTools display
- [ ] PDFScreen using StyledPDF with inline props
- [ ] GlueStack tokens used for dimensions and colors ($full, $white, etc.)
- [ ] StyleSheet.create cleaned up (pdf style removed)

### Functionality

- [ ] PDF rendering matches exactly as before
- [ ] PDF scrolling and zooming work correctly
- [ ] Share button functionality unchanged
- [ ] Loading state displays correctly

### Testing

- [ ] Visual regression testing complete (screenshots compared)
- [ ] Unit tests passing: `yarn test PDFScreen`
- [ ] E2E tests passing: `yarn detox:ios:test -f "PDF"`
- [ ] Full validation passing: `yarn validate`

### Documentation

- [ ] StyledPDF pattern documented in code comments
- [ ] Example added to `.claude/docs/react-patterns.md` (if not already present)

## Definition of Done

- `react-native-pdf` component wrapped with `styled()` function
- PDFScreen using StyledPDF with inline prop styling
- GlueStack tokens used consistently ($full, $white, etc.)
- No visual or functional regressions
- All tests passing (unit + E2E + validate)
- Code follows design system patterns from `.claude/docs/react-patterns.md`

**Last Updated**: 2025-01-17
