# TASK-341: Settings Account RNTL Tests

**Task ID**: TASK-341
**Title**: Settings Account RNTL Tests
**User Story**: [US-061](../stories/US-061-settings-account-section.md) - Settings Account Section
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: ⏳ In Progress
**Priority**: Medium
**Effort**: 1.5 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-338, TASK-339

---

## Context

Write comprehensive RNTL tests for the Settings Account section and UserCard component.

---

## Objective

Write RNTL tests for:

1. UserCard component
2. SettingsScreen Account section (authenticated)
3. SettingsScreen Account section (not authenticated)
4. Sign Out functionality

**Deliverable**: 100% test coverage for Account section components.

---

## Test Files

### UserCard Tests

Create `src/components/UserCard/__tests__/UserCard.rntl.tsx`:

```typescript
import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { UserCard } from '../UserCard';

describe('UserCard', () => {
  const defaultProps = {
    firstName: 'Warren',
    lastName: 'de Leon',
    email: 'warren@example.com',
    profilePicture: null,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders full name correctly', () => {
    const { getByText } = render(<UserCard {...defaultProps} />);
    expect(getByText('Warren de Leon')).toBeTruthy();
  });

  it('renders email correctly', () => {
    const { getByText } = render(<UserCard {...defaultProps} />);
    expect(getByText('warren@example.com')).toBeTruthy();
  });

  it('renders initials when no profile picture', () => {
    const { getByText } = render(<UserCard {...defaultProps} />);
    expect(getByText('WD')).toBeTruthy();
  });

  it('handles missing first name', () => {
    const { getByText } = render(
      <UserCard {...defaultProps} firstName={null} />
    );
    expect(getByText('de Leon')).toBeTruthy();
    expect(getByText('D')).toBeTruthy(); // Initials
  });

  it('handles missing last name', () => {
    const { getByText } = render(
      <UserCard {...defaultProps} lastName={null} />
    );
    expect(getByText('Warren')).toBeTruthy();
    expect(getByText('W')).toBeTruthy(); // Initials
  });

  it('handles missing both names', () => {
    const { getByText } = render(
      <UserCard {...defaultProps} firstName={null} lastName={null} />
    );
    expect(getByText('User')).toBeTruthy();
    expect(getByText('U')).toBeTruthy(); // Initials fallback
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(<UserCard {...defaultProps} />);
    fireEvent.press(getByTestId('user-card'));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility props', () => {
    const { getByRole } = render(<UserCard {...defaultProps} />);
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Account for Warren de Leon');
    expect(button.props.accessibilityHint).toBe('Opens account settings');
  });

  it('does not render chevron when onPress not provided', () => {
    const { queryByTestId } = render(
      <UserCard {...defaultProps} onPress={undefined} />
    );
    // Chevron should not be rendered
    // (Test implementation depends on how chevron is structured)
  });
});
```

### SettingsScreen Account Section Tests

Update `src/features/Settings/__tests__/SettingsScreen.rntl.tsx`:

```typescript
describe('SettingsScreen Account Section', () => {
  describe('when authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseAppSelector.mockReturnValue({
        firstName: 'Warren',
        lastName: 'de Leon',
        email: 'warren@example.com',
        profilePicture: null,
      });
    });

    it('renders UserCard with user info', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Warren de Leon')).toBeTruthy();
      expect(getByText('warren@example.com')).toBeTruthy();
    });

    it('renders Sign Out button', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Sign Out')).toBeTruthy();
    });

    it('calls logout and navigates to Home on Sign Out', async () => {
      const { getByText } = render(<SettingsScreen />);
      fireEvent.press(getByText('Sign Out'));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    it('navigates to EditAccount when UserCard pressed', () => {
      const { getByTestId } = render(<SettingsScreen />);
      fireEvent.press(getByTestId('user-card'));
      expect(mockNavigate).toHaveBeenCalledWith('EditAccount');
    });
  });

  describe('when not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it('renders Sign In button', () => {
      const { getByText } = render(<SettingsScreen />);
      expect(getByText('Sign In / Create Account')).toBeTruthy();
    });

    it('does not render UserCard', () => {
      const { queryByTestId } = render(<SettingsScreen />);
      expect(queryByTestId('user-card')).toBeNull();
    });

    it('navigates to Login when Sign In pressed', () => {
      const { getByText } = render(<SettingsScreen />);
      fireEvent.press(getByText('Sign In / Create Account'));
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });
});
```

---

## Coverage Requirements

| File                                   | Coverage Target |
| -------------------------------------- | --------------- |
| `UserCard.tsx`                         | 100%            |
| `SettingsScreen.tsx` (account section) | 100%            |

---

## Acceptance Criteria

- [ ] UserCard tests complete with 100% coverage
- [ ] SettingsScreen account section tests complete
- [ ] Tests for authenticated state
- [ ] Tests for unauthenticated state
- [ ] Sign Out functionality tested
- [ ] All tests pass
- [ ] Tests follow existing patterns

---

**Estimated Time**: 1.5 hours
**Last Updated**: 2025-11-25
