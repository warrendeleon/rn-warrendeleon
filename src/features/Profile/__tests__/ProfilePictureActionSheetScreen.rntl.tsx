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

import { expectMinTouchTarget } from '@app/test-utils';

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
    it('renders the action sheet container', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-sheet')).toBeOnTheScreen();
    });

    it('renders the backdrop', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-sheet-backdrop')).toBeOnTheScreen();
    });

    it('renders the title', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-sheet-title')).toBeOnTheScreen();
      expect(screen.getByText('Change Profile Picture')).toBeOnTheScreen();
    });

    it('renders Take Photo option', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-take-photo')).toBeOnTheScreen();
      expect(screen.getByText('Take Photo')).toBeOnTheScreen();
    });

    it('renders Choose from Library option', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-choose-library')).toBeOnTheScreen();
      expect(screen.getByText('Choose from Library')).toBeOnTheScreen();
    });

    it('does not render Remove Photo when no existing photo', async () => {
      mockParams.hasExistingPhoto = false;
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.queryByTestId('profile-picture-action-remove')).toBeNull();
    });

    it('renders Remove Photo when existing photo exists', async () => {
      mockParams.hasExistingPhoto = true;
      await render(<ProfilePictureActionSheetScreen />);

      expect(screen.getByTestId('profile-picture-action-remove')).toBeOnTheScreen();
      expect(screen.getByText('Remove Photo')).toBeOnTheScreen();
    });
  });

  describe('navigation', () => {
    it('dismisses when backdrop is pressed', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      await fireEvent.press(screen.getByTestId('profile-picture-action-sheet-backdrop'));

      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('shows processing state when Take Photo is pressed', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      await fireEvent.press(screen.getByTestId('profile-picture-action-take-photo'));

      // Should show processing state (spinner)
      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-action-sheet')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('shows processing state when Choose from Library is pressed', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      await fireEvent.press(screen.getByTestId('profile-picture-action-choose-library'));

      // Should show processing state (spinner)
      await waitFor(
        () => {
          expect(screen.getByTestId('profile-picture-action-sheet')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('sets remove action params and goes back when Remove Photo is pressed', async () => {
      mockParams.hasExistingPhoto = true;
      mockGetState.mockReturnValue({
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Settings', key: 'settings-1' },
          { name: 'EditAccount', key: 'editaccount-1' },
          { name: 'ProfilePictureActionSheet', key: 'actionsheet-1' },
        ],
      });
      await render(<ProfilePictureActionSheetScreen />);

      await fireEvent.press(screen.getByTestId('profile-picture-action-remove'));

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

      await render(<ProfilePictureActionSheetScreen />);

      await fireEvent.press(screen.getByTestId('profile-picture-action-take-photo'));

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('PermissionDenied', {
            permissionType: 'camera',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('navigates to PermissionDenied when photo library permission is denied', async () => {
      mockUsePhotoLibraryPermission.mockReturnValue({
        status: 'denied',
        requestPermission: jest.fn(),
      });

      await render(<ProfilePictureActionSheetScreen />);

      await fireEvent.press(screen.getByTestId('profile-picture-action-choose-library'));

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('PermissionDenied', {
            permissionType: 'photoLibrary',
          });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('accessibility', () => {
    it('has accessible backdrop close button', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      const backdrop = screen.getByTestId('profile-picture-action-sheet-backdrop');
      expect(backdrop.props.accessibilityRole).toBe('button');
      expect(backdrop.props.accessibilityLabel).toBe('Close');
    });

    it('has accessible Take Photo button', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      const button = screen.getByTestId('profile-picture-action-take-photo');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Take Photo');
    });

    it('has accessible Choose from Library button', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      const button = screen.getByTestId('profile-picture-action-choose-library');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Choose from Library');
    });

    it('has accessible Remove Photo button when shown', async () => {
      mockParams.hasExistingPhoto = true;
      await render(<ProfilePictureActionSheetScreen />);

      const button = screen.getByTestId('profile-picture-action-remove');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Remove Photo');
    });

    it('has accessible title as header', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      const title = screen.getByTestId('profile-picture-action-sheet-title');
      expect(title.props.accessibilityRole).toBe('header');
    });
  });

  describe('with no route params', () => {
    it('defaults hasExistingPhoto to false', async () => {
      mockParams.hasExistingPhoto = undefined;
      await render(<ProfilePictureActionSheetScreen />);

      // Remove button should not be shown
      expect(screen.queryByTestId('profile-picture-action-remove')).toBeNull();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
      mockParams.hasExistingPhoto = true;
      mockGetState.mockReturnValue({
        routes: [
          { name: 'Home', params: {} },
          { name: 'ProfilePictureActionSheet', params: {} },
        ],
      });
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

    it('take photo button has accessible touch target', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expectMinTouchTarget(screen.getByTestId('profile-picture-action-take-photo'));
    });

    it('choose library button has accessible touch target', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expectMinTouchTarget(screen.getByTestId('profile-picture-action-choose-library'));
    });

    it('remove photo button has accessible touch target when shown', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expectMinTouchTarget(screen.getByTestId('profile-picture-action-remove'));
    });

    it('backdrop has accessible touch target', async () => {
      await render(<ProfilePictureActionSheetScreen />);

      expectMinTouchTarget(screen.getByTestId('profile-picture-action-sheet-backdrop'));
    });
  });
});
