# TASK-066: Update HomeScreen Tests for ProfileCard

**Task ID**: TASK-066
**Title**: Update HomeScreen Tests to Include ProfileCard
**User Story**: [US-013: Profile Card on Home Screen](../stories/US-013-profile-card-home-screen.md)
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 0.5 hours

---

## Description

Update the existing HomeScreen.rntl.tsx test file to include tests for the ProfileCard component integration. Verify that the ProfileCard renders with correct data from Redux and navigates properly when pressed.

---

## Acceptance Criteria

- [ ] Existing HomeScreen tests still pass
- [ ] New test verifies ProfileCard renders
- [ ] New test verifies ProfileCard displays correct Redux data
- [ ] New test verifies pressing ProfileCard navigates to ProfileData
- [ ] Test verifies ProfileCard positioned before button groups
- [ ] All 7+ tests passing (5 existing + 2 new minimum)
- [ ] No test regressions or failures

---

## Implementation Details

**New Tests to Add:**

```typescript
describe('HomeScreen with ProfileCard', () => {
  it('renders ProfileCard component', () => {
    const { getByTestId } = renderWithProviders(<HomeScreen />);
    expect(getByTestId('profile-card')).toBeTruthy();
  });

  it('displays profile data from Redux', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('Warren de Leon')).toBeTruthy();
    expect(getByText('View Profile')).toBeTruthy();
  });

  it('navigates to ProfileData when ProfileCard pressed', () => {
    const mockNavigation = {
      navigate: jest.fn(),
    };
    const { getByTestId } = renderWithProviders(<HomeScreen />);

    fireEvent.press(getByTestId('profile-card'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileData');
  });
});
```

**Existing Tests to Verify:**

- renders without crashing
- renders complete component tree
- renders button and calls navigation when clicked
- navigates to Settings when handleSettingsPress is called
- exports handleSettingsPress function

---

## Technical Approach

1. Run existing tests to ensure baseline passing
2. Add new describe block for ProfileCard integration
3. Write test for ProfileCard rendering
4. Write test for Redux data display
5. Write test for navigation on press
6. Mock Redux state with profile data if needed
7. Verify all tests pass
8. Check coverage hasn't decreased

**Test Data:**

```typescript
const mockProfileData = {
  profilePicture: 'https://avatars.githubusercontent.com/u/12345',
  name: 'Warren',
  lastName: 'de Leon',
  // ... other profile fields
};
```

---

## Edge Cases to Consider

- ProfileCard appears before button groups in render order
- ProfileCard respects theme changes like other components
- Navigation mock properly captures ProfileData navigation
- Profile data from Redux is properly passed as props

---

## Related Tasks

- [TASK-063](./TASK-063-create-profile-card.md) - ProfileCard component
- [TASK-064](./TASK-064-integrate-profile-card-home.md) - HomeScreen integration (prerequisite)
- [TASK-065](./TASK-065-test-profile-card.md) - ProfileCard unit tests

---

## Notes

Keep existing test structure and patterns. Add new tests without disrupting current coverage. The goal is to maintain or improve overall test coverage.

Current HomeScreen tests: 5 passing
Target after update: 7-8 passing (including new ProfileCard tests)

---

**Last Updated**: 2025-11-15
