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
    it('renders the profile picture section', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-section')).toBeTruthy();
    });

    it('renders the edit button', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-edit-button')).toBeTruthy();
    });

    it('renders helper text', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      expect(screen.getByText('Tap to change')).toBeTruthy();
    });

    it('renders avatar with initials when no profile picture', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      // Avatar should show display name for fallback
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('navigates to action sheet when avatar is pressed', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-picture-edit-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ProfilePictureActionSheet', {
        hasExistingPhoto: false,
      });
    });

    it('passes hasExistingPhoto=true when profile picture URL exists', () => {
      render(
        <ProfilePictureSection
          {...defaultProps}
          profilePictureUrl="https://example.com/photo.jpg"
        />
      );

      fireEvent.press(screen.getByTestId('profile-picture-edit-button'));

      expect(mockNavigate).toHaveBeenCalledWith('ProfilePictureActionSheet', {
        hasExistingPhoto: true,
      });
    });

    it('does not navigate when loading', () => {
      render(<ProfilePictureSection {...defaultProps} isLoading={true} />);

      fireEvent.press(screen.getByTestId('profile-picture-edit-button'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible edit button', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      const button = screen.getByTestId('profile-picture-edit-button');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Edit profile picture');
      expect(button.props.accessibilityHint).toBe('Opens options to change your profile picture');
    });

    it('has accessible helper text', () => {
      render(<ProfilePictureSection {...defaultProps} />);

      const helperText = screen.getByText('Tap to change');
      expect(helperText.props.accessibilityLabel).toBe('Tap to change');
    });
  });

  describe('loading state', () => {
    it('reduces opacity when loading', () => {
      render(<ProfilePictureSection {...defaultProps} isLoading={true} />);

      const button = screen.getByTestId('profile-picture-edit-button');
      // GlueStack UI applies opacity prop directly
      expect(button.props.opacity).toBe(0.5);
    });
  });
});
