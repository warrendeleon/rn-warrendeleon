# TASK-107: Write Profile Screen Tests (RNTL)

**Epic**: [EPIC-012: Profile Screen Implementation](../epics/EPIC-012-profile-screen-implementation.md)
**User Story**: [US-021: Profile Screen UI Redesign](../stories/US-021-profile-screen-ui.md)
**Status**: ⭕ Not Started
**Priority**: High
**Estimated Effort**: 1.5 hours
**Created**: 2025-01-17

---

## Context

Create comprehensive unit tests for the ProfileScreen component using React Native Testing Library (RNTL). Tests should cover rendering, user interactions, Redux integration, state management, error handling, and accessibility.

## Technical Details

### Test Files to Create

```
src/features/Profile/__tests__/ProfileScreen.rntl.tsx
```

### Test Coverage Areas

**Component Rendering**:

- Component renders without errors
- Profile data displays correctly when loaded
- Profile photo displays with fallback
- Name and headline display prominently
- Social links section renders

**User Interactions**:

- Tapping social links triggers navigation/actions
- Tapping navigation shortcuts navigates to correct screen
- Loading state displays during data fetch
- Error state displays with retry option
- Retry button works to re-fetch data

**Redux Integration**:

- Fetches profile data from Redux selector
- Displays data from Redux state correctly
- Handles Redux data updates

**State Management**:

- Displays loading indicator when loading = true
- Displays error message when error exists
- Displays empty state when no data available
- Handles data transitions (loading → success, loading → error)

**Styling & Theme**:

- Light mode colours apply correctly
- Dark mode colours apply correctly
- Theme changes update styling
- Proper spacing and layout alignment

**Accessibility (EAA Compliance)**:

- All buttons have proper accessibilityRole
- All buttons have descriptive accessibilityLabel
- Images have proper accessibilityLabel
- Screen readers can navigate content
- All touch targets meet minimum size requirements
- Proper colour contrast (no verification in unit tests, but structure present)
- Heading hierarchy is logical

### Test Structure Template

```typescript
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ProfileScreen } from '../ProfileScreen';
import type { Profile } from '@app/types/portfolio';

const mockStore = configureStore([]);

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useRoute: () => ({}),
}));

describe('ProfileScreen', () => {
  // Test cases follow...
});
```

### Key Test Cases

1. **Rendering Tests**

   ```typescript
   it('renders profile screen without errors', () => {
     // Render with mock Redux store
     // Verify no errors
   });

   it('displays profile data when loaded', () => {
     // Mock store with profile data
     // Verify name, headline, bio display
   });

   it('displays profile photo with fallback', () => {
     // Test with photo URL
     // Test without photo (fallback)
   });

   it('renders social links section', () => {
     // Verify GitHub, LinkedIn, email links render
   });
   ```

2. **Interaction Tests**

   ```typescript
   it('navigates to Education screen when Education button tapped', () => {
     // Mock navigation
     // Tap button
     // Verify navigate called with correct screen
   });

   it('opens GitHub profile when GitHub link tapped', () => {
     // Tap GitHub link
     // Verify navigation or URL opening
   });
   ```

3. **State Management Tests**

   ```typescript
   it('displays loading indicator when loading', () => {
     // Mock store with loading: true
     // Verify activity indicator displays
   });

   it('displays error message when error occurs', () => {
     // Mock store with error message
     // Verify error text displays
   });

   it('shows retry button in error state', () => {
     // Mock error state
     // Verify retry button present
     // Tap retry and verify action
   });
   ```

4. **Redux Integration Tests**

   ```typescript
   it('fetches profile data from Redux on mount', () => {
     // Mock dispatch spy
     // Verify action dispatched on mount
   });

   it('updates when Redux state changes', () => {
     // Mock store with initial data
     // Render component
     // Mock store with new data
     // Verify component updates
   });
   ```

5. **Accessibility Tests**

   ```typescript
   it('has proper accessibility roles', () => {
     // Verify buttons have accessibilityRole: 'button'
     // Verify images have accessibilityRole: 'image'
   });

   it('has descriptive accessibility labels', () => {
     // Verify all buttons have accessibilityLabel
     // Verify labels are descriptive
   });

   it('has proper touch target sizes', () => {
     // Verify interactive elements meet minimum size
     // Check via layout or style properties
   });
   ```

## Acceptance Criteria

- ✅ ProfileScreen.rntl.tsx test file created
- ✅ All component rendering scenarios tested
- ✅ All user interactions tested (navigation, link tapping, button presses)
- ✅ Redux integration tested (data fetching, state management)
- ✅ Loading state tested
- ✅ Error state tested with retry functionality
- ✅ Empty state tested
- ✅ Dark mode styling tested
- ✅ EAA accessibility compliance verified (roles, labels, touch targets)
- ✅ Snapshot tests created for visual regression
- ✅ Test coverage meets threshold (>80% branches, >85% statements)
- ✅ All tests pass with `yarn test`
- ✅ No console warnings or errors during test execution

## Test Coverage Requirements

- **Branches**: >80%
- **Statements**: >85%
- **Functions**: >80%
- **Lines**: >85%

## Test Scenarios

### Rendering (5 tests)

1. ✅ Component renders without errors
2. ✅ Displays profile data when loaded
3. ✅ Shows profile photo and fallback
4. ✅ Displays name and headline
5. ✅ Renders social links section

### User Interactions (6 tests)

6. ✅ Navigates to Education screen
7. ✅ Navigates to Work Experience screen
8. ✅ Navigates to CV viewer
9. ✅ Opens GitHub profile link
10. ✅ Opens LinkedIn profile link
11. ✅ Opens email composer

### State Management (5 tests)

12. ✅ Displays loading indicator
13. ✅ Displays error message
14. ✅ Shows retry button
15. ✅ Displays empty state when no data
16. ✅ Handles loading → success transition

### Redux Integration (3 tests)

17. ✅ Fetches profile data on mount
18. ✅ Reads data from Redux selector
19. ✅ Updates on Redux state changes

### Accessibility (4 tests)

20. ✅ All buttons have proper accessibility roles
21. ✅ All interactive elements have descriptive labels
22. ✅ Images have proper accessibility labels
23. ✅ Touch targets meet minimum size

### Styling (3 tests)

24. ✅ Light mode styling applies correctly
25. ✅ Dark mode styling applies correctly
26. ✅ Responsive layout works on all screen sizes

## Dependencies

**Prerequisites**:

- ✅ TASK-105: ProfileScreen component created
- ✅ Jest and RNTL configured
- ✅ redux-mock-store available

**Enables**:

- TASK-108: E2E tests for profile navigation

## Success Criteria

- All unit tests pass
- Test coverage meets thresholds (>80% branches, >85% statements)
- Snapshots captured for visual regression
- Edge cases covered (loading, error, empty states)
- Professional test quality matching project standards
- EAA accessibility requirements verified

## Implementation Notes

- Use `redux-mock-store` for mocking Redux state
- Mock React Navigation hooks (`useNavigation`, `useRoute`)
- Mock image loading to avoid native dependencies
- Test both certificate and non-certificate scenarios
- Verify data formatting and mapping logic
- Consider edge cases: missing photo, long names, multiple social links
- Use testID props from component for robust element selection
- Add comprehensive comments explaining complex test logic

## Notes

- Follow the same testing patterns as TASK-077 (Education Screen tests)
- Snapshots help catch unintended visual changes
- Test Redux integration to ensure data flows correctly
- Verify all navigation routes match actual app structure
- Consider accessibility requirements from EAA compliance guide
- Test should be thorough but efficient (fast execution)
