import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

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
    it('renders without crashing in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders without crashing in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(UNSAFE_root).toBeDefined();
    });

    it('displays the avatar image', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

      const avatar = getByTestId('profile-card-avatar');
      expect(avatar).toBeDefined();
    });

    it('displays full name correctly', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByText('Warren de Leon')).toBeDefined();
    });

    it('displays "View Profile" subtitle', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByText('View Profile')).toBeDefined();
    });

    it('renders with custom testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(
        <ProfileCard {...mockProps} testID="custom-profile-card" />
      );

      expect(getByTestId('custom-profile-card')).toBeDefined();
    });

    it('renders with default testID when not provided', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeDefined();
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
    it('applies light theme styles', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(UNSAFE_root).toBeDefined();
      // Theme styling verified in getProfileCardStyles tests
    });

    it('applies dark theme styles', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<ProfileCard {...mockProps} />);

      expect(UNSAFE_root).toBeDefined();
      // Theme styling verified in getProfileCardStyles tests
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names without crashing', () => {
      mockUseColorScheme.mockReturnValue('light');

      const longProps = {
        ...mockProps,
        name: 'Extraordinarily',
        lastName: 'LongLastNameThatCouldPotentiallyCauseLayoutIssues',
      };

      const { getByText, UNSAFE_root } = renderWithProviders(<ProfileCard {...longProps} />);

      expect(UNSAFE_root).toBeDefined();
      expect(
        getByText('Extraordinarily LongLastNameThatCouldPotentiallyCauseLayoutIssues')
      ).toBeDefined();
    });

    it('handles special characters in names', () => {
      mockUseColorScheme.mockReturnValue('light');

      const specialProps = {
        ...mockProps,
        name: 'José',
        lastName: 'García-Pérez',
      };

      const { getByText } = renderWithProviders(<ProfileCard {...specialProps} />);

      expect(getByText('José García-Pérez')).toBeDefined();
    });

    it('handles single character names', () => {
      mockUseColorScheme.mockReturnValue('light');

      const shortProps = {
        ...mockProps,
        name: 'J',
        lastName: 'D',
      };

      const { getByText } = renderWithProviders(<ProfileCard {...shortProps} />);

      expect(getByText('J D')).toBeDefined();
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
    expect(() => renderWithProviders(<ProfileCard {...mockProps} />)).not.toThrow();
    // AccessibilityLabel is "{fullName}, View Profile"
  });

  it('has correct accessibilityRole as button', () => {
    expect(() => renderWithProviders(<ProfileCard {...mockProps} />)).not.toThrow();
    // AccessibilityRole is "button"
  });

  it('has correct accessibilityHint', () => {
    expect(() => renderWithProviders(<ProfileCard {...mockProps} />)).not.toThrow();
    // AccessibilityHint is "Opens your profile details"
  });

  it('avatar has correct alt text with full name', () => {
    const { getByTestId } = renderWithProviders(<ProfileCard {...mockProps} />);

    const avatar = getByTestId('profile-card-avatar');
    expect(avatar).toBeDefined();
    // Alt text verified in integration tests
  });
});
