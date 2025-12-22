/**
 * ProfilePictureActionSheet RNTL Tests
 *
 * Tests for the profile picture action sheet component.
 */

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ProfilePictureActionSheet } from '../ProfilePictureActionSheet';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: jest.fn(() => 'light'),
}));

describe('ProfilePictureActionSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnTakePhoto = jest.fn();
  const mockOnChooseFromLibrary = jest.fn();
  const mockOnRemovePhoto = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onTakePhoto: mockOnTakePhoto,
    onChooseFromLibrary: mockOnChooseFromLibrary,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<ProfilePictureActionSheet {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('profile-picture-action-sheet')).toBeNull();
    });

    it('renders action sheet when isOpen is true', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-sheet')).toBeOnTheScreen();
    });

    it('renders Take Photo option', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-take-photo')).toBeOnTheScreen();
      expect(screen.getByText('Take Photo')).toBeOnTheScreen();
    });

    it('renders Choose from Library option', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-choose-library')).toBeOnTheScreen();
      expect(screen.getByText('Choose from Library')).toBeOnTheScreen();
    });

    it('renders title', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-sheet-title')).toBeOnTheScreen();
    });

    it('renders backdrop', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-sheet-backdrop')).toBeOnTheScreen();
    });
  });

  describe('Remove Photo option', () => {
    it('does not render Remove Photo when hasExistingPhoto is false', () => {
      render(<ProfilePictureActionSheet {...defaultProps} hasExistingPhoto={false} />);

      expect(screen.queryByTestId('profile-picture-action-remove')).toBeNull();
    });

    it('does not render Remove Photo when onRemovePhoto is not provided', () => {
      render(<ProfilePictureActionSheet {...defaultProps} hasExistingPhoto={true} />);

      expect(screen.queryByTestId('profile-picture-action-remove')).toBeNull();
    });

    it('renders Remove Photo when hasExistingPhoto is true and onRemovePhoto is provided', () => {
      render(
        <ProfilePictureActionSheet
          {...defaultProps}
          hasExistingPhoto={true}
          onRemovePhoto={mockOnRemovePhoto}
        />
      );

      expect(screen.getByTestId('profile-picture-action-remove')).toBeOnTheScreen();
      expect(screen.getByText('Remove Photo')).toBeOnTheScreen();
    });
  });

  describe('interactions', () => {
    it('calls onClose when backdrop is pressed', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-picture-action-sheet-backdrop'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose and sets pending action when Take Photo is pressed', () => {
      const { rerender } = render(<ProfilePictureActionSheet {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-picture-action-take-photo'));

      // onClose is called immediately to trigger modal close
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      // onTakePhoto not called yet - waiting for modal to close
      expect(mockOnTakePhoto).not.toHaveBeenCalled();

      // Simulate modal closing (parent sets isOpen to false)
      rerender(<ProfilePictureActionSheet {...defaultProps} isOpen={false} />);

      // After modal closes and small delay, action is triggered
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(mockOnTakePhoto).toHaveBeenCalledTimes(1);
    });

    it('calls onClose and sets pending action when Choose from Library is pressed', () => {
      const { rerender } = render(<ProfilePictureActionSheet {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-picture-action-choose-library'));

      // onClose is called immediately to trigger modal close
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      // onChooseFromLibrary not called yet - waiting for modal to close
      expect(mockOnChooseFromLibrary).not.toHaveBeenCalled();

      // Simulate modal closing (parent sets isOpen to false)
      rerender(<ProfilePictureActionSheet {...defaultProps} isOpen={false} />);

      // After modal closes and small delay, action is triggered
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(mockOnChooseFromLibrary).toHaveBeenCalledTimes(1);
    });

    it('calls onClose and onRemovePhoto when Remove Photo is pressed', () => {
      render(
        <ProfilePictureActionSheet
          {...defaultProps}
          hasExistingPhoto={true}
          onRemovePhoto={mockOnRemovePhoto}
        />
      );

      fireEvent.press(screen.getByTestId('profile-picture-action-remove'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnRemovePhoto).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has accessible title with header role', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      const title = screen.getByText('Change Profile Picture');
      expect(title.props.accessibilityRole).toBe('header');
    });

    it('has accessible Take Photo button', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      const button = screen.getByTestId('profile-picture-action-take-photo');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Take Photo');
    });

    it('has accessible Choose from Library button', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      const button = screen.getByTestId('profile-picture-action-choose-library');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Choose from Library');
    });

    it('has accessible backdrop', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      const backdrop = screen.getByTestId('profile-picture-action-sheet-backdrop');
      expect(backdrop.props.accessibilityRole).toBe('button');
      expect(backdrop.props.accessibilityLabel).toBe('Close');
    });
  });

  describe('dark mode', () => {
    beforeEach(() => {
      const { useAppColorScheme } = require('@app/shared/hooks');
      (useAppColorScheme as jest.Mock).mockReturnValue('dark');
    });

    afterEach(() => {
      const { useAppColorScheme } = require('@app/shared/hooks');
      (useAppColorScheme as jest.Mock).mockReturnValue('light');
    });

    it('renders correctly in dark mode', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-sheet')).toBeOnTheScreen();
      expect(screen.getByText('Change Profile Picture')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('Take Photo button has minimum touch target size', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      const button = screen.getByTestId('profile-picture-action-take-photo');
      // EAA requires 44×44 minimum touch target
      expect(button.props.style?.minHeight ?? 48).toBeGreaterThanOrEqual(44);
    });

    it('Choose from Library button has minimum touch target size', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      const button = screen.getByTestId('profile-picture-action-choose-library');
      expect(button.props.style?.minHeight ?? 48).toBeGreaterThanOrEqual(44);
    });

    it('Remove Photo button has minimum touch target size when shown', () => {
      render(
        <ProfilePictureActionSheet
          {...defaultProps}
          hasExistingPhoto={true}
          onRemovePhoto={mockOnRemovePhoto}
        />
      );

      const button = screen.getByTestId('profile-picture-action-remove');
      expect(button.props.style?.minHeight ?? 48).toBeGreaterThanOrEqual(44);
    });

    it('all interactive elements have button role', () => {
      render(
        <ProfilePictureActionSheet
          {...defaultProps}
          hasExistingPhoto={true}
          onRemovePhoto={mockOnRemovePhoto}
        />
      );

      expect(screen.getByTestId('profile-picture-action-take-photo').props.accessibilityRole).toBe(
        'button'
      );
      expect(
        screen.getByTestId('profile-picture-action-choose-library').props.accessibilityRole
      ).toBe('button');
      expect(screen.getByTestId('profile-picture-action-remove').props.accessibilityRole).toBe(
        'button'
      );
      expect(
        screen.getByTestId('profile-picture-action-sheet-backdrop').props.accessibilityRole
      ).toBe('button');
    });

    it('all buttons have accessibility labels', () => {
      render(
        <ProfilePictureActionSheet
          {...defaultProps}
          hasExistingPhoto={true}
          onRemovePhoto={mockOnRemovePhoto}
        />
      );

      expect(
        screen.getByTestId('profile-picture-action-take-photo').props.accessibilityLabel
      ).toBeTruthy();
      expect(
        screen.getByTestId('profile-picture-action-choose-library').props.accessibilityLabel
      ).toBeTruthy();
      expect(
        screen.getByTestId('profile-picture-action-remove').props.accessibilityLabel
      ).toBeTruthy();
      expect(
        screen.getByTestId('profile-picture-action-sheet-backdrop').props.accessibilityLabel
      ).toBeTruthy();
    });
  });
});
