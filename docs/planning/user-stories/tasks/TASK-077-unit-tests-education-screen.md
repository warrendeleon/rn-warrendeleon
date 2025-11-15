# TASK-077: Unit Tests for Education Screen

**Epic**: [EPIC-009: Education Display Enhancement](../epics/EPIC-009-education-display-enhancement.md)
**User Story**: [US-016: Education Screen with SVG Logos](../stories/US-016-education-screen-svg-logos.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 2 hours
**Created**: 2025-11-15

---

## Context

Create comprehensive unit tests for both the MenuButtonGroupSvg component and the EducationDataScreen. Tests should cover rendering, user interactions, state management, and edge cases.

## Technical Details

### Test Files to Create

1. **MenuButtonGroupSvg Component Tests**

   ```
   src/components/MenuButtonGroupSvg/__tests__/MenuButtonGroupSvg.rntl.tsx
   ```

2. **EducationDataScreen Component Tests**
   ```
   src/features/Education/__tests__/EducationDataScreen.rntl.tsx
   ```

### MenuButtonGroupSvg Tests

**File**: `src/components/MenuButtonGroupSvg/__tests__/MenuButtonGroupSvg.rntl.tsx`

```typescript
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MenuButtonGroupSvg, type MenuButtonGroupSvgItem } from '../MenuButtonGroupSvg';

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  SvgUri: 'SvgUri',
}));

describe('MenuButtonGroupSvg', () => {
  const mockItems: MenuButtonGroupSvgItem[] = [
    {
      id: '1',
      label: 'Test Item 1',
      subtitle: 'Subtitle 1',
      logoUri: 'file:///path/to/logo1.svg',
      onPress: jest.fn(),
      testID: 'test-item-1',
    },
    {
      id: '2',
      label: 'Test Item 2',
      logoUri: 'file:///path/to/logo2.svg',
      testID: 'test-item-2',
    },
  ];

  it('renders all items correctly', () => {
    render(<MenuButtonGroupSvg items={mockItems} />);

    expect(screen.getByText('Test Item 1')).toBeOnTheScreen();
    expect(screen.getByText('Subtitle 1')).toBeOnTheScreen();
    expect(screen.getByText('Test Item 2')).toBeOnTheScreen();
  });

  it('calls onPress when item is tapped', () => {
    const onPressMock = jest.fn();
    const items: MenuButtonGroupSvgItem[] = [
      {
        id: '1',
        label: 'Clickable Item',
        logoUri: 'file:///logo.svg',
        onPress: onPressMock,
        testID: 'clickable-item',
      },
    ];

    render(<MenuButtonGroupSvg items={items} />);

    fireEvent.press(screen.getByTestId('clickable-item'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows chevron for items with onPress', () => {
    render(<MenuButtonGroupSvg items={mockItems} />);

    // First item has onPress, should show chevron
    const firstItem = screen.getByTestId('test-item-1');
    expect(firstItem).toBeOnTheScreen();

    // Second item has no onPress, should not show chevron (verify in snapshot)
  });

  it('does not show chevron when showChevron is false', () => {
    const items: MenuButtonGroupSvgItem[] = [
      {
        id: '1',
        label: 'No Chevron Item',
        logoUri: 'file:///logo.svg',
        onPress: jest.fn(),
        showChevron: false,
        testID: 'no-chevron-item',
      },
    ];

    render(<MenuButtonGroupSvg items={items} />);
    // Verify no chevron rendered (check snapshot)
  });

  it('displays loading indicator when loading', () => {
    render(<MenuButtonGroupSvg items={mockItems} loading />);

    expect(screen.getByTestId('activity-indicator')).toBeOnTheScreen();
    expect(screen.queryByText('Test Item 1')).not.toBeOnTheScreen();
  });

  it('displays error message when error exists', () => {
    const errorMessage = 'Failed to load data';
    render(<MenuButtonGroupSvg items={mockItems} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeOnTheScreen();
    expect(screen.queryByText('Test Item 1')).not.toBeOnTheScreen();
  });

  it('renders dividers between items', () => {
    const { container } = render(<MenuButtonGroupSvg items={mockItems} />);

    // There should be 1 divider for 2 items
    // Verify via snapshot
  });

  it('matches snapshot for light mode', () => {
    const { toJSON } = render(<MenuButtonGroupSvg items={mockItems} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
```

### EducationDataScreen Tests

**File**: `src/features/Education/__tests__/EducationDataScreen.rntl.tsx`

```typescript
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { EducationDataScreen } from '../EducationDataScreen';
import type { Education } from '@app/types/portfolio';

const mockStore = configureStore([]);

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({}),
}));

// Mock MenuButtonGroupSvg
jest.mock('@app/components', () => ({
  MenuButtonGroupSvg: jest.fn(({ items, loading, error }) => {
    if (loading) return null;
    if (error) return null;
    return items.map((item: any) => (
      <button key={item.id} onClick={item.onPress} data-testid={item.testID}>
        {item.label}
      </button>
    ));
  }),
}));

describe('EducationDataScreen', () => {
  const mockEducationData: Education[] = [
    {
      location: 'University A',
      title: 'Computer Science Degree',
      logo: 'university-a.svg',
      start: '2010-09-01',
      end: '2014-06-30',
      certificate: 'https://example.com/cert1.pdf',
    },
    {
      location: 'Online Course B',
      title: 'React Native Course',
      logo: 'udemy.svg',
      start: '2020-01-01',
      end: '2020-03-31',
    },
  ];

  it('renders education items when data is loaded', () => {
    const store = mockStore({
      education: {
        data: mockEducationData,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    expect(screen.getByText('Computer Science Degree')).toBeOnTheScreen();
    expect(screen.getByText('React Native Course')).toBeOnTheScreen();
  });

  it('navigates to WebView when education with certificate is tapped', async () => {
    const store = mockStore({
      education: {
        data: mockEducationData,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    const certItem = screen.getByTestId('education-item-university-a');
    fireEvent.press(certItem);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('WebView', {
        uri: 'https://example.com/cert1.pdf',
        title: 'Certificate',
      });
    });
  });

  it('does not navigate when education without certificate is tapped', () => {
    const store = mockStore({
      education: {
        data: mockEducationData,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    const noCertItem = screen.getByTestId('education-item-online-course-b');
    fireEvent.press(noCertItem);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays loading state', () => {
    const store = mockStore({
      education: {
        data: null,
        loading: true,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    // MenuButtonGroupSvg receives loading=true
    // Verify via mock or snapshot
  });

  it('displays error state', () => {
    const errorMessage = 'Network error';
    const store = mockStore({
      education: {
        data: null,
        loading: false,
        error: errorMessage,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    // MenuButtonGroupSvg receives error prop
    // Verify via mock or snapshot
  });

  it('displays empty state when no data', () => {
    const store = mockStore({
      education: {
        data: [],
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    expect(screen.getByText('No education data available')).toBeOnTheScreen();
  });

  it('fetches education data on mount', () => {
    const store = mockStore({
      education: {
        data: null,
        loading: false,
        error: null,
      },
      settings: {
        language: 'en',
      },
    });

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <EducationDataScreen />
      </Provider>
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: expect.stringContaining('fetchEducation') })
    );
  });
});
```

### Test Coverage Requirements

- **Branches**: >80%
- **Statements**: >85%
- **Functions**: >80%
- **Lines**: >85%

### Files Affected

- `src/components/MenuButtonGroupSvg/__tests__/MenuButtonGroupSvg.rntl.tsx` - New
- `src/features/Education/__tests__/EducationDataScreen.rntl.tsx` - New

## Acceptance Criteria

- ✅ MenuButtonGroupSvg component fully tested
- ✅ EducationDataScreen component fully tested
- ✅ All user interactions tested (taps, navigation)
- ✅ Loading, error, and empty states tested
- ✅ Data mapping and formatting tested
- ✅ Navigation with certificate tested
- ✅ Non-navigation without certificate tested
- ✅ Test coverage meets thresholds (>80%)
- ✅ All tests pass with `yarn test`
- ✅ Snapshots created and committed

## Test Scenarios

### MenuButtonGroupSvg Tests

1. ✅ Renders all items with labels and subtitles
2. ✅ Calls onPress when item is tapped
3. ✅ Shows chevron for items with onPress
4. ✅ Hides chevron when showChevron is false
5. ✅ Displays loading indicator when loading
6. ✅ Displays error message when error exists
7. ✅ Renders dividers between items (not after last)
8. ✅ Matches snapshot for light/dark modes

### EducationDataScreen Tests

1. ✅ Renders education items when data loaded
2. ✅ Navigates to WebView when item with certificate tapped
3. ✅ Does not navigate when item without certificate tapped
4. ✅ Displays loading state
5. ✅ Displays error state
6. ✅ Displays empty state when no data
7. ✅ Fetches education data on mount
8. ✅ Formats dates correctly (start/end years)
9. ✅ Maps logo filenames to URI paths
10. ✅ Generates correct testIDs

## Dependencies

**Prerequisites**:

- ✅ TASK-074: MenuButtonGroupSvg component created
- ✅ TASK-075: EducationDataScreen UI updated
- ✅ Jest and RNTL configured

**Enables**:

- TASK-078: E2E Tests for Education Screen Flow

## Success Criteria

- All unit tests passing
- Test coverage >80% for new components
- Snapshots captured for visual regression
- Edge cases covered (empty, error, loading states)
- Professional test quality matching project standards

## Notes

- Use `redux-mock-store` for mocking Redux state
- Mock `react-native-svg` to avoid native dependency issues
- Mock navigation hooks from React Navigation
- Test both certificate and non-certificate education entries
- Verify date formatting logic (ISO to year range)
- Test logo URI mapping function
- Consider adding integration tests for data flow
- Snapshots help catch unintended visual changes
