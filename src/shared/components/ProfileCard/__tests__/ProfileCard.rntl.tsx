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
    it('renders in light mode with profile-card testID', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });

    it('renders in dark mode with profile-card testID', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });

    it('displays the avatar image', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

      const avatar = getByTestId('profile-card-avatar');
      expect(avatar).toBeOnTheScreen();
    });

    it('displays full name correctly', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByText('Warren de Leon')).toBeOnTheScreen();
    });

    it('displays "View Profile" subtitle', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByText('View Profile')).toBeOnTheScreen();
    });

    it('renders with custom testID', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(
        <ProfileCard {...mockProps} testID="custom-profile-card" />
      );

      expect(getByTestId('custom-profile-card')).toBeOnTheScreen();
    });

    it('renders with default testID when not provided', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when pressed', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const onPressMock = jest.fn();
      const { getByTestId } = await renderWithProviders(
        <ProfileCard {...mockProps} onPress={onPressMock} />
      );

      const card = getByTestId('profile-card');
      await fireEvent.press(card);

      expect(onPressMock).toHaveBeenCalledTimes(1);
      // RNTL 14's fireEvent.press forwards the press event to the handler
      expect(onPressMock).toHaveBeenCalledWith(expect.any(Object));
    });

    it('calls onPress multiple times when pressed multiple times', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const onPressMock = jest.fn();
      const { getByTestId } = await renderWithProviders(
        <ProfileCard {...mockProps} onPress={onPressMock} />
      );

      const card = getByTestId('profile-card');
      await fireEvent.press(card);
      await fireEvent.press(card);
      await fireEvent.press(card);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Theme Support', () => {
    it('applies light theme and renders correctly', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, getByText } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('View Profile')).toBeOnTheScreen();
    });

    it('applies dark theme and renders correctly', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId, getByText } = await renderWithProviders(<ProfileCard {...mockProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(getByText('Warren de Leon')).toBeOnTheScreen();
      expect(getByText('View Profile')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names correctly', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const longProps = {
        ...mockProps,
        name: 'Extraordinarily',
        lastName: 'LongLastNameThatCouldPotentiallyCauseLayoutIssues',
      };

      const { getByText, getByTestId } = await renderWithProviders(<ProfileCard {...longProps} />);

      expect(getByTestId('profile-card')).toBeOnTheScreen();
      expect(
        getByText('Extraordinarily LongLastNameThatCouldPotentiallyCauseLayoutIssues')
      ).toBeOnTheScreen();
    });

    it('handles special characters in names', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const specialProps = {
        ...mockProps,
        name: 'José',
        lastName: 'García-Pérez',
      };

      const { getByText } = await renderWithProviders(<ProfileCard {...specialProps} />);

      expect(getByText('José García-Pérez')).toBeOnTheScreen();
    });

    it('handles single character names', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const shortProps = {
        ...mockProps,
        name: 'J',
        lastName: 'D',
      };

      const { getByText } = await renderWithProviders(<ProfileCard {...shortProps} />);

      expect(getByText('J D')).toBeOnTheScreen();
    });
  });
});

describe('getProfileCardStyles', () => {
  it('returns light mode styles', () => {
    const styles = getProfileCardStyles('light');

    expect(styles.bg).toBe('#FFFFFF');
    expect(styles.nameColor).toBe('#000000');
    expect(styles.subtitleColor).toBe('#6B6B6B');
    expect(styles.chevronColor).toBe('#6B6B6B');
  });

  it('returns dark mode styles', () => {
    const styles = getProfileCardStyles('dark');

    expect(styles.bg).toBe('#262626');
    expect(styles.nameColor).toBe('#FFFFFF');
    expect(styles.subtitleColor).toBe('#A3A3A3');
    expect(styles.chevronColor).toBe('#A3A3A3');
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

  it('has correct accessibilityLabel with full name and action', async () => {
    const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expect(card.props.accessibilityLabel).toBe('Warren de Leon, View Profile');
  });

  it('has correct accessibilityRole as button', async () => {
    const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expect(card.props.accessibilityRole).toBe('button');
  });

  it('has correct accessibilityHint', async () => {
    const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expect(card.props.accessibilityHint).toBe('Opens your profile details');
  });

  it('is queryable by button role', async () => {
    const { getByRole } = await renderWithProviders(<ProfileCard {...mockProps} />);

    expect(getByRole('button')).toBeOnTheScreen();
  });

  it('avatar has correct testID', async () => {
    const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

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

  it('card has accessible touch target (44×44 minimum)', async () => {
    const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expectMinTouchTarget(card);
  });

  it('card maintains accessible touch target in dark mode', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByTestId } = await renderWithProviders(<ProfileCard {...mockProps} />);

    const card = getByTestId('profile-card');
    expectMinTouchTarget(card);
  });

  it('card with custom testID has accessible touch target', async () => {
    const { getByTestId } = await renderWithProviders(
      <ProfileCard {...mockProps} testID="custom-profile" />
    );

    const card = getByTestId('custom-profile');
    expectMinTouchTarget(card);
  });
});
