# TASK-082: Unit Tests for WorkExperienceScreen

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-017: Work Experience Screen with Company Logos](../stories/US-017-work-experience-screen-display.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 2 hours
**Created**: 2025-11-16

---

## Context

Create comprehensive unit tests for the WorkExperienceScreen component using React Native Testing Library (RNTL). Tests should cover rendering, user interactions, navigation, state management, and edge cases to achieve >85% code coverage.

## Technical Details

### Test File Structure

**Location**: `src/features/WorkExperience/__tests__/WorkExperienceScreen.rntl.tsx`

```typescript
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { NavigationContainer } from '@react-navigation/native';

import { WorkExperienceScreen } from '../WorkExperienceScreen';
import type { WorkExperience } from '@app/types/portfolio';
import type { RootState } from '@app/store';

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

// Mock MenuButtonGroupSvg component
jest.mock('@app/components/MenuButtonGroupSvg', () => ({
  MenuButtonGroupSvg: jest.fn(({ items, loading, error }) => {
    const { View, Text, TouchableOpacity } = require('react-native');

    if (loading) {
      return (
        <View testID="menu-button-group-loading">
          <Text>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View testID="menu-button-group-error">
          <Text>{error}</Text>
        </View>
      );
    }

    if (!items || items.length === 0) {
      return (
        <View testID="menu-button-group-empty">
          <Text>No items</Text>
        </View>
      );
    }

    return (
      <View testID="menu-button-group">
        {items.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            testID={item.testID}
            accessibilityLabel={item.accessibilityLabel}
            accessibilityHint={item.accessibilityHint}
            accessibilityRole={item.accessibilityRole}
          >
            <Text>{item.label}</Text>
            <Text>{item.subtitle}</Text>
            {item.badge && <Text testID={`${item.testID}-badge`}>{item.badge}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    );
  }),
}));

describe('WorkExperienceScreen', () => {
  const mockWorkExperience: WorkExperience[] = [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      logo: 'https://example.com/techcorp.svg',
      start: '2020-01-01',
      end: '2023-06-30',
      clients: [
        { id: 'c1', name: 'Client A' },
        { id: 'c2', name: 'Client B' },
        { id: 'c3', name: 'Client C' },
      ],
    },
    {
      id: '2',
      company: 'Startup Inc',
      position: 'Lead Engineer',
      logo: 'https://example.com/startup.svg',
      start: '2018-03-15',
      end: '2019-12-31',
      // No clients
    },
    {
      id: '3',
      company: 'Current Company',
      position: 'Tech Lead',
      logo: 'https://example.com/current.svg',
      start: '2023-07-01',
      end: null, // Current position
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders work experience items when data is loaded', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByText('Senior Developer')).toBeOnTheScreen();
      expect(screen.getByText('Lead Engineer')).toBeOnTheScreen();
      expect(screen.getByText('Tech Lead')).toBeOnTheScreen();
    });

    it('displays company name and date range in subtitle', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByText(/Tech Corp • 2020 - 2023/)).toBeOnTheScreen();
      expect(screen.getByText(/Startup Inc • 2018 - 2019/)).toBeOnTheScreen();
      expect(screen.getByText(/Current Company • 2023 - Present/)).toBeOnTheScreen();
    });

    it('displays client count badge for multi-client positions', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // First item has 3 clients, should show badge
      const badgeElement = screen.getByTestId('work-experience-item-tech-corp-badge');
      expect(badgeElement).toBeOnTheScreen();
      expect(badgeElement).toHaveTextContent('3');

      // Second item has no clients, should not show badge
      expect(screen.queryByTestId('work-experience-item-startup-inc-badge')).not.toBeOnTheScreen();
    });

    it('displays loading state', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: true,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('menu-button-group-loading')).toBeOnTheScreen();
      expect(screen.queryByText('Senior Developer')).not.toBeOnTheScreen();
    });

    it('displays error state', () => {
      const errorMessage = 'Failed to load work experience';
      const store = mockStore({
        workExperience: {
          data: null,
          loading: false,
          error: errorMessage,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('menu-button-group-error')).toBeOnTheScreen();
      expect(screen.getByText(errorMessage)).toBeOnTheScreen();
    });

    it('displays empty state when no data', () => {
      const store = mockStore({
        workExperience: {
          data: [],
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByTestId('menu-button-group-empty')).toBeOnTheScreen();
    });
  });

  describe('Navigation', () => {
    it('navigates to Clients screen when tapping item with clients', async () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const techCorpItem = screen.getByTestId('work-experience-item-tech-corp');
      fireEvent.press(techCorpItem);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceClients', {
          workExperienceId: '1',
          companyName: 'Tech Corp',
        });
      });
    });

    it('navigates to WorkExperienceDetails screen when tapping item without clients', async () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const startupItem = screen.getByTestId('work-experience-item-startup-inc');
      fireEvent.press(startupItem);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('WorkExperienceDetails', {
          workExperienceId: '2',
          companyName: 'Startup Inc',
        });
      });
    });
  });

  describe('Data Fetching', () => {
    it('dispatches fetchWorkExperience on mount', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('fetchWorkExperience'),
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('provides accessibility labels for work experience items', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const techCorpItem = screen.getByTestId('work-experience-item-tech-corp');
      expect(techCorpItem).toHaveAccessibilityProperty(
        'label',
        expect.stringContaining('Senior Developer at Tech Corp')
      );
      expect(techCorpItem).toHaveAccessibilityProperty('role', 'button');
    });

    it('provides accessibility hint for items with clients', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const techCorpItem = screen.getByTestId('work-experience-item-tech-corp');
      expect(techCorpItem).toHaveAccessibilityProperty(
        'hint',
        expect.stringContaining('Tap to view 3 clients')
      );
    });

    it('provides accessibility hint for items without clients', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      const startupItem = screen.getByTestId('work-experience-item-startup-inc');
      expect(startupItem).toHaveAccessibilityProperty(
        'hint',
        expect.stringContaining('Tap to view company details')
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles work experience with missing end date (current position)', () => {
      const store = mockStore({
        workExperience: {
          data: [mockWorkExperience[2]], // Current position with end: null
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(screen.getByText(/2023 - Present/)).toBeOnTheScreen();
    });

    it('handles work experience with empty clients array', () => {
      const workExperienceWithEmptyClients: WorkExperience[] = [
        {
          ...mockWorkExperience[1],
          clients: [], // Empty array instead of undefined
        },
      ];

      const store = mockStore({
        workExperience: {
          data: workExperienceWithEmptyClients,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      // Should not show badge
      expect(screen.queryByTestId('work-experience-item-startup-inc-badge')).not.toBeOnTheScreen();
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with data', () => {
      const store = mockStore({
        workExperience: {
          data: mockWorkExperience,
          loading: false,
          error: null,
        },
      } as Partial<RootState>);

      const { toJSON } = render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with loading state', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: true,
          error: null,
        },
      } as Partial<RootState>);

      const { toJSON } = render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with error state', () => {
      const store = mockStore({
        workExperience: {
          data: null,
          loading: false,
          error: 'Network error',
        },
      } as Partial<RootState>);

      const { toJSON } = render(
        <Provider store={store}>
          <WorkExperienceScreen />
        </Provider>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});
```

### Test Coverage Requirements

- **Branches**: >85%
- **Statements**: >85%
- **Functions**: >85%
- **Lines**: >85%

### Files Affected

- `src/features/WorkExperience/__tests__/WorkExperienceScreen.rntl.tsx` - New test file
- `src/features/WorkExperience/__tests__/__snapshots__/` - Generated snapshots

## Acceptance Criteria

- ✅ WorkExperienceScreen component fully tested
- ✅ All rendering scenarios tested (data, loading, error, empty)
- ✅ Navigation tested (WorkExperienceClients screen, WorkExperienceDetails screen)
- ✅ Client count badge logic tested
- ✅ Date formatting tested (including "Present" for current positions)
- ✅ Data fetching on mount tested
- ✅ Accessibility properties tested (labels, hints, roles)
- ✅ Edge cases tested (missing end date, empty clients array)
- ✅ Snapshots created for visual regression
- ✅ Test coverage meets >85% threshold
- ✅ All tests pass with `yarn test`
- ✅ No console warnings or errors during tests

## Test Scenarios

### Rendering Tests

1. ✅ Renders work experience items when data loaded
2. ✅ Displays company name and date range in subtitle
3. ✅ Displays client count badge for multi-client positions
4. ✅ Does not show badge for positions without clients
5. ✅ Displays loading state
6. ✅ Displays error state with error message
7. ✅ Displays empty state when no data

### Navigation Tests

8. ✅ Navigates to WorkExperienceClients screen when tapping item with clients
9. ✅ Navigates to WorkExperienceDetails screen when tapping item without clients
10. ✅ Passes correct params (workExperienceId, companyName)

### Data Fetching Tests

11. ✅ Dispatches fetchWorkExperience on mount

### Accessibility Tests

12. ✅ Provides accessibility labels for items
13. ✅ Provides accessibility hints (clients vs details)
14. ✅ Sets accessibility role to "button"

### Edge Case Tests

15. ✅ Handles current positions (end date is null → "Present")
16. ✅ Handles empty clients array (no badge shown)
17. ✅ Handles special characters in company names (testID generation)

### Snapshot Tests

18. ✅ Matches snapshot with data
19. ✅ Matches snapshot with loading state
20. ✅ Matches snapshot with error state

## Dependencies

**Prerequisites**:

- ✅ TASK-080: WorkExperienceScreen component created
- ✅ TASK-085: Work Experience Redux slice implemented
- ✅ Jest and RNTL configured

**Enables**:

- TASK-083: E2E Tests for Work Experience Flow (unit tests must pass first)

## Success Criteria

- All unit tests passing
- Test coverage >85% for WorkExperienceScreen component
- Snapshots captured for visual regression testing
- Edge cases properly covered
- Accessibility testing comprehensive
- Professional test quality matching project standards
- Tests serve as documentation for component behaviour

## Notes

- Use `redux-mock-store` for mocking Redux state
- Mock MenuButtonGroupSvg component to isolate WorkExperienceScreen logic
- Mock navigation hooks from React Navigation
- Test both client and non-client work experience entries
- Verify date formatting logic (ISO to year range, "Present" handling)
- Test testID generation (company name to kebab-case)
- Consider adding integration tests for full data flow in future
- Snapshots help catch unintended visual or structural changes
- Follow same testing pattern as EducationDataScreen tests (TASK-077)
