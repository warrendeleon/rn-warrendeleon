/**
 * ProfilePictureSection RNTL Tests
 *
 * Tests for the profile picture section component.
 * The component displays a user avatar with an edit button that navigates
 * to the ProfilePictureActionSheet screen.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProfilePictureSection } from '../ProfilePictureSection';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: jest.fn(() => 'light'),
}));

describe('ProfilePictureSection', () => {
  const defaultProps = {
    displayName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the profile picture section', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-section')).toBeOnTheScreen();
    });

    it('renders the edit button', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-edit-button')).toBeOnTheScreen();
    });

    it('renders helper text', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      expect(screen.getByText('Tap to change')).toBeOnTheScreen();
    });

    it('renders avatar with initials when no profile picture', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      // Avatar shows initials derived from the display name as fallback
      expect(screen.getByText('JD')).toBeOnTheScreen();
    });
  });

  describe('navigation', () => {
    it('navigates to action sheet when avatar is pressed', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      await fireEvent.press(screen.getByTestId('profile-picture-edit-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ProfilePictureActionSheet', {
        hasExistingPhoto: false,
      });
    });

    it('passes hasExistingPhoto=true when profile picture URL exists', async () => {
      await render(
        <ProfilePictureSection
          {...defaultProps}
          profilePictureUrl="https://example.com/photo.jpg"
        />
      );

      await fireEvent.press(screen.getByTestId('profile-picture-edit-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ProfilePictureActionSheet', {
        hasExistingPhoto: true,
      });
    });

    it('does not navigate when loading', async () => {
      await render(<ProfilePictureSection {...defaultProps} isLoading={true} />);

      await fireEvent.press(screen.getByTestId('profile-picture-edit-button'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible edit button', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      const button = screen.getByTestId('profile-picture-edit-button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Edit profile picture');
      expect(button.props.accessibilityHint).toBe('Opens options to change your profile picture');
    });

    it('has accessible helper text', async () => {
      await render(<ProfilePictureSection {...defaultProps} />);

      const helperText = screen.getByText('Tap to change');
      expect(helperText.props.accessibilityLabel).toBe('Tap to change');
    });
  });

  describe('loading state', () => {
    it('reduces opacity when loading', async () => {
      await render(<ProfilePictureSection {...defaultProps} isLoading={true} />);

      const button = screen.getByTestId('profile-picture-edit-button');
      // Opacity is applied via inline style on the v2 Pressable
      expect(button.props.style).toEqual(expect.objectContaining({ opacity: 0.5 }));
    });
  });
});
