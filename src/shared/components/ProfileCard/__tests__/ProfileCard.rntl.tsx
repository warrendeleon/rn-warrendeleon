import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

// Import directly to avoid circular dependency
import { getProfileCardStyles, ProfileCard } from '../ProfileCard';

describe('ProfileCard', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  const mockProps = {
    profilePicture: 'https://example.com/avatar.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders in light mode with profile-card testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });

    it('renders in dark mode with profile-card testID', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });

    it('displays the avatar image', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

      const avatar = getByTestId('profile-card-avatar');
      expect(avatar).toBeOnTheScreen();
    });

    it('displays full name correctly', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('displays "View Profile" subtitle', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByText('View Profile')).toBeOnTheScreen();
    });

    it('renders with custom testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(
        <ProfileCard {...mockProps} testID="custom-profile-card" />
      );

      expect(getByTestId('custom-profile-card')).toBeOnTheScreen();
    });

    it('renders with default testID when not provided', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', () => {
      mockUseColorScheme.mockReturnValue('light');

      const onPressMock = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProfileCard {...mockProps} onPress={onPressMock} />
      );

      const card = getByTestId('profile-card');
      fireEvent.press(card);

      expect(onPressMock).toHaveBeenCalledTimes(1);
      expect(onPressMock).toHaveBeenCalledWith();
    });

    it('calls onPress multiple times when pressed multiple times', () => {
      mockUseColorScheme.mockReturnValue('light');

      const onPressMock = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProfileCard {...mockProps} onPress={onPressMock} />
      );

      const card = getByTestId('profile-card');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Theme Support', () => {
    it('applies light theme and renders correctly', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, getByText } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('View Profile')).toBeOnTheScreen();
    });

    it('applies dark theme and renders correctly', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId, getByText } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('View Profile')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names correctly', () => {
      mockUseColorScheme.mockReturnValue('light');

      const longProps = {
        ...mockProps,
        name: 'Extraordinarily',
        lastName: 'LongLastNameThatCouldPotentiallyCauseLayoutIssues',
      };

      const { getByText, getByTestId } = renderWithProviders(<ProfileCard {...longProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(
        getByText('Extraordinarily LongLastNameThatCouldPotentiallyCauseLayoutIssues')
      ).toBeOnTheScreen();
    });

    it('handles special characters in names', () => {
      mockUseColorScheme.mockReturnValue('light');

      const specialProps = {
        ...mockProps,
        name: 'José',
        lastName: 'García-Pérez',
      };

      const { getByText } = renderWithProviders(<ProfileCard {...specialProps} />);

      expect(getByText('José García-Pérez')).toBeOnTheScreen();
    });

    it('handles single character names', () => {
      mockUseColorScheme.mockReturnValue('light');

      const shortProps = {
        ...mockProps,
        name: 'J',
        lastName: 'D',
      };

      const { getByText } = renderWithProviders(<ProfileCard {...shortProps} />);

      expect(getByText('J D')).toBeOnTheScreen();
    });
  });
});

describe('getProfileCardStyles', () => {
  it('returns light mode styles', () => {
    const styles = getProfileCardStyles('light');

    expect(styles.bg).toBe('$white');
    expect(styles.nameColor).toBe('$black');
    expect(styles.subtitleColor).toBe('$textLight500');
    expect(styles.chevronColor).toBe('$textLight500');
  });

  it('returns dark mode styles', () => {
    const styles = getProfileCardStyles('dark');

    expect(styles.bg).toBe('$backgroundDark900');
    expect(styles.nameColor).toBe('$white');
    expect(styles.subtitleColor).toBe('$textLight400');
    expect(styles.chevronColor).toBe('$textLight400');
  });

  it('returns different background colors for light and dark modes', () => {
    const lightStyles = getProfileCardStyles('light');
    const darkStyles = getProfileCardStyles('dark');

    expect(lightStyles.bg).not.toBe(darkStyles.bg);
  });

  it('returns different text colors for light and dark modes', () => {
    const lightStyles = getProfileCardStyles('light');
    const darkStyles = getProfileCardStyles('dark');

    expect(lightStyles.nameColor).not.toBe(darkStyles.nameColor);
  });
});

describe('ProfileCard accessibility', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  const mockProps = {
    profilePicture: 'https://example.com/avatar.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('has correct accessibilityLabel with full name and action', () => {
    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expect(card.props.accessibilityLabel).toBe('Warren de Leon, View Profile');
  });

  it('has correct accessibilityRole as button', () => {
    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expect(card.props.accessibilityRole).toBe('button');
  });

  it('has correct accessibilityHint', () => {
    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expect(card.props.accessibilityHint).toBe('Opens your profile details');
  });

  it('is queryable by button role', () => {
    const { getByRole } = renderWithProviders(<ProfileCard {...mockProps} />);

    expect(getByRole('button')).toBeOnTheScreen();
  });

  it('avatar has correct testID', () => {
    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const avatar = getByTestId('profile-card-avatar');
    expect(avatar).toBeOnTheScreen();
  });
});

describe('ProfileCard EAA Accessibility Compliance', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  const mockProps = {
    profilePicture: 'https://example.com/avatar.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('card has accessible touch target (44×44 minimum)', () => {
    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expectMinTouchTarget(card);
  });

  it('card maintains accessible touch target in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expectMinTouchTarget(card);
  });

  it('card with custom testID has accessible touch target', () => {
    const { getByTestId } = renderWithProviders(
      <ProfileCard {...mockProps} testID="custom-profile" />
    );

    const card = getByTestId('custom-profile');
    expectMinTouchTarget(card);
  });
});
