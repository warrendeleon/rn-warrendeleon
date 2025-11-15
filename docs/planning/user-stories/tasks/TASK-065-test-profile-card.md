# TASK-065: Add Unit Tests for ProfileCard

**Task ID**: TASK-065
**Title**: Add Unit Tests for ProfileCard Component
**User Story**: [US-013: Profile Card on Home Screen](../stories/US-013-profile-card-home-screen.md)
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 1 hour

---

## Description

Write comprehensive unit tests for the ProfileCard component using React Native Testing Library. Ensure the component renders correctly, handles props properly, and responds to user interactions.

---

## Acceptance Criteria

- [ ] Test file created at `src/components/ProfileCard/__tests__/ProfileCard.rntl.tsx`
- [ ] Tests render component without crashing
- [ ] Tests verify avatar displays with correct source
- [ ] Tests verify name and lastName displayed correctly
- [ ] Tests verify "View Profile" subtitle rendered
- [ ] Tests verify chevron icon present
- [ ] Tests verify onPress handler called when pressed
- [ ] Tests verify component renders in both light/dark themes
- [ ] All tests passing
- [ ] Test coverage meets or exceeds project threshold

---

## Implementation Details

**Test File Structure:**

```typescript
describe('ProfileCard', () => {
  const mockProps = {
    profilePicture: 'https://example.com/avatar.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    onPress: jest.fn(),
  };

  describe('Rendering', () => {
    it('renders without crashing', () => { ... });
    it('displays the avatar image', () => { ... });
    it('displays full name correctly', () => { ... });
    it('displays "View Profile" subtitle', () => { ... });
    it('displays chevron icon', () => { ... });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', () => { ... });
    it('responds to press with visual feedback', () => { ... });
  });

  describe('Theme Support', () => {
    it('applies light theme styles', () => { ... });
    it('applies dark theme styles', () => { ... });
  });
});
```

**Test Coverage:**

- Component rendering
- Props handling
- User interactions
- Theme switching
- Edge cases (long names, missing data)

**Assertions:**

- Avatar image has correct source URI
- Full name matches "Warren de Leon" format
- Subtitle text is "View Profile"
- onPress called with no arguments
- Chevron icon present in component tree

---

## Technical Approach

1. Create test file in **tests** directory
2. Set up mock props
3. Write rendering tests with renderWithProviders
4. Write interaction tests with fireEvent
5. Write theme tests with different theme values
6. Test edge cases (empty strings, special characters)
7. Verify all tests pass
8. Check coverage report

**Testing Utilities:**

- renderWithProviders (for theme/Redux context)
- screen from @testing-library/react-native
- fireEvent for press interactions
- Custom queries for finding elements

---

## Edge Cases to Test

- Empty profile picture URL (should not crash)
- Very long names (should not overflow)
- Special characters in names (é, ñ, etc.)
- Missing lastName (should still render)
- Rapid repeated presses (should not cause issues)

---

## Related Tasks

- [TASK-063](./TASK-063-create-profile-card.md) - Component implementation (prerequisite)
- [TASK-066](./TASK-066-update-home-screen-tests.md) - Integration tests

---

## Notes

Follow existing test patterns from ButtonWithChevron and ChevronButtonGroup tests. Aim for similar or better coverage.

Target: 100% line/branch coverage for the ProfileCard component.

---

**Last Updated**: 2025-11-15
