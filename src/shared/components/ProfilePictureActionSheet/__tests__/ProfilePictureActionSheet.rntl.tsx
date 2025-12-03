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

      expect(screen.getByTestId('profile-picture-action-sheet')).toBeTruthy();
    });

    it('renders Take Photo option', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-take-photo')).toBeTruthy();
      expect(screen.getByText('Take Photo')).toBeTruthy();
    });

    it('renders Choose from Library option', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-choose-library')).toBeTruthy();
      expect(screen.getByText('Choose from Library')).toBeTruthy();
    });

    it('renders title', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-sheet-title')).toBeTruthy();
    });

    it('renders backdrop', () => {
      render(<ProfilePictureActionSheet {...defaultProps} />);

      expect(screen.getByTestId('profile-picture-action-sheet-backdrop')).toBeTruthy();
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

      expect(screen.getByTestId('profile-picture-action-remove')).toBeTruthy();
      expect(screen.getByText('Remove Photo')).toBeTruthy();
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

      expect(screen.getByTestId('profile-picture-action-sheet')).toBeTruthy();
      expect(screen.getByText('Change Profile Picture')).toBeTruthy();
    });
  });
});
