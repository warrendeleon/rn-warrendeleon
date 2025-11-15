# TASK-071: Unit Tests for PDFScreen

**Epic**: [EPIC-008: Document Viewing](../epics/EPIC-008-document-viewing.md)
**User Story**: [US-015: CV PDF Viewer](../stories/US-015-cv-pdf-viewer.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 1 hour
**Created**: 2025-11-15

---

## Context

Add comprehensive unit tests for the PDFScreen component to ensure it correctly renders PDFs, handles navigation params, and integrates with the share functionality.

## Technical Details

### Test File Structure

**File**: `src/features/PDF/__tests__/PDFScreen.rntl.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';

import { PDFScreen } from '../PDFScreen';
import type { RootStackParamList } from '@app/navigation';

// Mock dependencies
jest.mock('react-native-pdf', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View testID="mock-pdf" {...props} />,
  };
});

jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
  })),
}));

jest.mock('@app/hooks', () => ({
  useAppColorScheme: jest.fn(() => 'light'),
}));

describe('PDFScreen', () => {
  const mockRoute = {
    params: {
      uri: 'https://example.com/document.pdf',
      title: 'Test PDF',
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (require('@react-navigation/native').useRoute as jest.Mock).mockReturnValue(mockRoute);
  });

  it('renders PDF component with correct URI', () => {
    const { getByTestID } = render(<PDFScreen />);

    const pdf = getByTestID('mock-pdf');
    expect(pdf).toBeTruthy();
    expect(pdf.props.source).toEqual({
      uri: 'https://example.com/document.pdf',
      cache: true,
    });
  });

  it('enables caching for offline viewing', () => {
    const { getByTestID } = render(<PDFScreen />);

    const pdf = getByTestID('mock-pdf');
    expect(pdf.props.source.cache).toBe(true);
  });

  it('disables trust all certs for security', () => {
    const { getByTestID } = render(<PDFScreen />);

    const pdf = getByTestID('mock-pdf');
    expect(pdf.props.trustAllCerts).toBe(false);
  });

  it('applies full screen styles', () => {
    const { getByTestID } = render(<PDFScreen />);

    const pdf = getByTestID('mock-pdf');
    expect(pdf.props.style).toMatchObject({
      flex: 1,
      width: '100%',
      height: '100%',
    });
  });

  it('sets up share button in header', () => {
    const mockSetOptions = jest.fn();
    (require('@react-navigation/native').useNavigation as jest.Mock).mockReturnValue({
      setOptions: mockSetOptions,
    });

    render(<PDFScreen />);

    expect(mockSetOptions).toHaveBeenCalled();
    const options = mockSetOptions.mock.calls[0][0];
    expect(options.headerRight).toBeDefined();
  });
});
```

### Coverage Requirements

**Target**: 100% on business logic
**Excludes**: Platform-specific share sheet behavior (tested in E2E)

**Must Cover**:

- PDF component rendering
- URI parameter passing
- Cache enablement
- Security settings (trustAllCerts)
- Style application
- Share button setup

## Acceptance Criteria

- ✅ Test file created at src/features/PDF/**tests**/PDFScreen.rntl.tsx
- ✅ react-native-pdf properly mocked
- ✅ react-native-share properly mocked
- ✅ All props tested (URI, cache, trustAllCerts)
- ✅ Header share button tested
- ✅ 100% coverage on component logic
- ✅ All tests passing with `yarn test`

## Test Scenarios

### Scenario 1: Component renders

**GIVEN** PDFScreen receives route params
**WHEN** the component renders
**THEN** it should render the PDF component
**AND** pass the correct props

### Scenario 2: Cache enabled

**GIVEN** PDFScreen renders
**WHEN** checking the source prop
**THEN** cache should be true
**AND** enable offline viewing

### Scenario 3: Security settings

**GIVEN** PDFScreen renders
**WHEN** checking security props
**THEN** trustAllCerts should be false
**AND** validate HTTPS certificates

## Dependencies

**Prerequisites**:

- ✅ TASK-068: Create PDFScreen Component
- ✅ TASK-070: Add Share Button

**Enables**:

- Test coverage reporting
- Confidence in refactoring

## Success Criteria

- All PDFScreen unit tests passing
- 100% coverage on component logic
- Tests follow project patterns (RNTL, mocks)
- Ready for E2E testing

## Notes

- Mock react-native-pdf to avoid native dependencies in tests
- Mock react-native-share to avoid platform-specific behavior
- Focus on component logic, not native PDF rendering
- Share functionality fully tested in E2E (TASK-072)
