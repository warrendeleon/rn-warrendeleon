/**
 * ProfileCard Snapshot Tests
 *
 * Verifies visual consistency of the ProfileCard component across all states.
 * Uses @testing-library/react-native for compatibility with GlueStack UI components.
 */

import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { getProfileCardStyles, ProfileCard, ProfileCardProps } from '../ProfileCard';

// Mock react-native-vector-icons for consistent snapshots
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

describe('ProfileCard Snapshots', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  const defaultProps: ProfileCardProps = {
    profilePicture: 'https://example.com/avatar.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    onPress: jest.fn(),
    testID: 'profile-card',
  };

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    jest.clearAllMocks();
  });

  describe('Light Mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders default state in light mode', () => {
      const { toJSON } = renderWithProviders(<ProfileCard {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot('ProfileCard - Light Mode Default');
    });

    it('renders with custom testID in light mode', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} testID="custom-profile" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Light Mode Custom TestID');
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('renders default state in dark mode', () => {
      const { toJSON } = renderWithProviders(<ProfileCard {...defaultProps} />);
      expect(toJSON()).toMatchSnapshot('ProfileCard - Dark Mode Default');
    });
  });

  describe('Name Variants', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders with short name', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} name="J" lastName="D" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Short Name');
    });

    it('renders with long name', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard
          {...defaultProps}
          name="Extraordinarily"
          lastName="LongLastNameThatCouldPotentiallyCauseLayoutIssues"
        />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Long Name');
    });

    it('renders with special characters in name', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} name="José" lastName="García-Pérez" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Special Characters Name');
    });

    it('renders with Unicode characters', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} name="田中" lastName="太郎" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Unicode Name');
    });

    it('renders with emoji in name', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} name="John 👨‍💻" lastName="Doe" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Emoji Name');
    });
  });

  describe('Avatar Variants', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders with valid avatar URL', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} profilePicture="https://example.com/avatar.png" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Valid Avatar URL');
    });

    it('renders with placeholder avatar URL', () => {
      const { toJSON } = renderWithProviders(
        <ProfileCard {...defaultProps} profilePicture="https://via.placeholder.com/150" />
      );
      expect(toJSON()).toMatchSnapshot('ProfileCard - Placeholder Avatar');
    });

    it('renders with empty avatar URL', () => {
      const { toJSON } = renderWithProviders(<ProfileCard {...defaultProps} profilePicture="" />);
      expect(toJSON()).toMatchSnapshot('ProfileCard - Empty Avatar URL');
    });
  });

  describe('Theme Transitions', () => {
    it('light and dark modes produce different outputs', () => {
      mockUseColorScheme.mockReturnValue('light');
      const { toJSON: lightJSON } = renderWithProviders(<ProfileCard {...defaultProps} />);

      mockUseColorScheme.mockReturnValue('dark');
      const { toJSON: darkJSON } = renderWithProviders(<ProfileCard {...defaultProps} />);

      // Verify they produce different visual output
      expect(lightJSON()).not.toEqual(darkJSON());
    });
  });
});

describe('getProfileCardStyles Snapshots', () => {
  it('light mode styles match snapshot', () => {
    const styles = getProfileCardStyles('light');
    expect(styles).toMatchSnapshot('getProfileCardStyles - Light Mode');
  });

  it('dark mode styles match snapshot', () => {
    const styles = getProfileCardStyles('dark');
    expect(styles).toMatchSnapshot('getProfileCardStyles - Dark Mode');
  });

  it('styles are consistent between calls', () => {
    const styles1 = getProfileCardStyles('light');
    const styles2 = getProfileCardStyles('light');

    expect(styles1).toEqual(styles2);
  });
});

describe('ProfileCard Snapshot Consistency', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  const defaultProps: ProfileCardProps = {
    profilePicture: 'https://example.com/avatar.jpg',
    name: 'Warren',
    lastName: 'de Leon',
    onPress: jest.fn(),
    testID: 'profile-card',
  };

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('produces consistent output between renders', () => {
    const { toJSON: toJSON1 } = renderWithProviders(<ProfileCard {...defaultProps} />);
    const { toJSON: toJSON2 } = renderWithProviders(<ProfileCard {...defaultProps} />);

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(toJSON1())).toBe(JSON.stringify(toJSON2()));
  });

  it('memoisation does not affect snapshot output', () => {
    // ProfileCard uses React.memo - verify snapshots are consistent
    const { toJSON: toJSON1 } = renderWithProviders(<ProfileCard {...defaultProps} />);

    // Re-render with same props (should hit memo)
    const { toJSON: toJSON2 } = renderWithProviders(<ProfileCard {...defaultProps} />);

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(toJSON1())).toBe(JSON.stringify(toJSON2()));
  });
});
