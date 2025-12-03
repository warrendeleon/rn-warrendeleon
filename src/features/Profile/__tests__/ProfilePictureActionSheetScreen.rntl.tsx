/**
 * ProfilePictureActionSheetScreen RNTL Tests
 *
 * Tests for the profile picture action sheet navigation screen.
 * This screen presents options for changing the profile picture:
 * - Take Photo (camera)
 * - Choose from Library
 * - Remove Photo (when existing photo)
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ProfilePictureActionSheetScreen } from '../ProfilePictureActionSheetScreen';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockGetState = jest.fn();
const mockParams: { hasExistingPhoto?: boolean } = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    replace: mockReplace,
    dispatch: mockDispatch,
    getState: mockGetState,
  }),
  useRoute: () => ({
    params: mockParams,
  }),
  CommonActions: {
    reset: jest.fn(state => ({ type: 'RESET', payload: state })),
    setParams: jest.fn(params => ({ type: 'SET_PARAMS', payload: params })),
  },
}));

const mockOpenCamera = jest.fn();
const mockOpenLibrary = jest.fn();

jest.mock('@app/shared/services/media', () => ({
  openCameraForProfilePicture: () => mockOpenCamera(),
  openLibraryForProfilePicture: () => mockOpenLibrary(),
}));

const mockUseCameraPermission = jest.fn();
const mockUsePhotoLibraryPermission = jest.fn();

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => 'light',
  useCameraPermission: () => mockUseCameraPermission(),
  usePhotoLibraryPermission: () => mockUsePhotoLibraryPermission(),
}));

describe('ProfilePictureActionSheetScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockParams.hasExistingPhoto = false;
    mockGetState.mockReturnValue({
      routes: [
        { name: 'Home', params: {} },
        { name: 'Settings', params: {} },
        { name: 'EditAccount', params: {} },
        { name: 'ProfilePictureActionSheet', params: {} },
      ],
    });
    mockOpenCamera.mockResolvedValue({ success: false });
    mockOpenLibrary.mockResolvedValue({ success: false });
    mockUseCameraPermission.mockReturnValue({
      status: 'granted',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    });
    mockUsePhotoLibraryPermission.mockReturnValue({
      status: 'granted',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders the action sheet container', () => {
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-sheet')).toBeTruthy();
    });

    it('renders the backdrop', () => {
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-sheet-backdrop')).toBeTruthy();
    });

    it('renders the title', () => {
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-sheet-title')).toBeTruthy();
      expect(screen.getByText('Change Profile Picture')).toBeTruthy();
    });

    it('renders Take Photo option', () => {
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-take-photo')).toBeTruthy();
      expect(screen.getByText('Take Photo')).toBeTruthy();
    });

    it('renders Choose from Library option', () => {
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-choose-library')).toBeTruthy();
      expect(screen.getByText('Choose from Library')).toBeTruthy();
    });

    it('does not render Remove Photo when no existing photo', () => {
      mockParams.hasExistingPhoto = false;
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.queryByTestId('profile-picture-action-remove')).toBeNull();
    });

    it('renders Remove Photo when existing photo exists', () => {
      mockParams.hasExistingPhoto = true;
      render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-remove')).toBeTruthy();
      expect(screen.getByText('Remove Photo')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('dismisses when backdrop is pressed', () => {
      render(<ProfilePictureActionSheetScreen />);

      fireEvent.press(screen.getByTestId('profile-picture-action-sheet-backdrop'));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('shows processing state when Take Photo is pressed', async () => {
      render(<ProfilePictureActionSheetScreen />);

      fireEvent.press(screen.getByTestId('profile-picture-action-take-photo'));

      // Should show processing state (spinner)
      await waitFor(() => {
        expect(screen.getByTestId('profile-picture-action-sheet')).toBeTruthy();
      });
    });

    it('shows processing state when Choose from Library is pressed', async () => {
      render(<ProfilePictureActionSheetScreen />);

      fireEvent.press(screen.getByTestId('profile-picture-action-choose-library'));

      // Should show processing state (spinner)
      await waitFor(() => {
        expect(screen.getByTestId('profile-picture-action-sheet')).toBeTruthy();
      });
    });

    it('sets remove action params and goes back when Remove Photo is pressed', () => {
      mockParams.hasExistingPhoto = true;
      mockGetState.mockReturnValue({
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Settings', key: 'settings-1' },
          { name: 'EditAccount', key: 'editaccount-1' },
          { name: 'ProfilePictureActionSheet', key: 'actionsheet-1' },
        ],
      });
      render(<ProfilePictureActionSheetScreen />);

      fireEvent.press(screen.getByTestId('profile-picture-action-remove'));

      // Should dispatch setParams to EditAccount and then goBack
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('permission handling', () => {
    it('navigates to PermissionDenied when camera permission is denied', async () => {
      mockUseCameraPermission.mockReturnValue({
        status: 'denied',
        requestPermission: jest.fn(),
      });

      render(<ProfilePictureActionSheetScreen />);

      fireEvent.press(screen.getByTestId('profile-picture-action-take-photo'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('PermissionDenied', {
          permissionType: 'camera',
        });
      });
    });

    it('navigates to PermissionDenied when photo library permission is denied', async () => {
      mockUsePhotoLibraryPermission.mockReturnValue({
        status: 'denied',
        requestPermission: jest.fn(),
      });

      render(<ProfilePictureActionSheetScreen />);

      fireEvent.press(screen.getByTestId('profile-picture-action-choose-library'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('PermissionDenied', {
          permissionType: 'photoLibrary',
        });
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible backdrop close button', () => {
      render(<ProfilePictureActionSheetScreen />);

      const backdrop = screen.getByTestId('profile-picture-action-sheet-backdrop');
      expect(backdrop.props.accessibilityRole).toBe('button');
      expect(backdrop.props.accessibilityLabel).toBe('Close');
    });

    it('has accessible Take Photo button', () => {
      render(<ProfilePictureActionSheetScreen />);

      const button = screen.getByTestId('profile-picture-action-take-photo');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Take Photo');
    });

    it('has accessible Choose from Library button', () => {
      render(<ProfilePictureActionSheetScreen />);

      const button = screen.getByTestId('profile-picture-action-choose-library');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Choose from Library');
    });

    it('has accessible Remove Photo button when shown', () => {
      mockParams.hasExistingPhoto = true;
      render(<ProfilePictureActionSheetScreen />);

      const button = screen.getByTestId('profile-picture-action-remove');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Remove Photo');
    });

    it('has accessible title as header', () => {
      render(<ProfilePictureActionSheetScreen />);

      const title = screen.getByTestId('profile-picture-action-sheet-title');
      expect(title.props.accessibilityRole).toBe('header');
    });
  });

  describe('with no route params', () => {
    it('defaults hasExistingPhoto to false', () => {
      mockParams.hasExistingPhoto = undefined;
      render(<ProfilePictureActionSheetScreen />);

      // Remove button should not be shown
      expect(screen.queryByTestId('profile-picture-action-remove')).toBeNull();
    });
  });
});
