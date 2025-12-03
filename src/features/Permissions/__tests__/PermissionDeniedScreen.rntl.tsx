/**
 * Tests for Permission Denied Screen
 *
 * Tests the permission denied screen for both camera and photo library.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { PermissionDeniedScreen } from '../PermissionDeniedScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { permissionType: 'camera' },
  }),
}));

// Mock permission hooks
const mockOpenAppSettings = jest.fn();

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => 'light',
  useCameraPermission: () => ({
    openAppSettings: mockOpenAppSettings,
    status: 'blocked',
    isGranted: false,
    isDenied: false,
    isBlocked: true,
    isLoading: false,
    canProceed: false,
    checkPermission: jest.fn(),
    requestPermission: jest.fn(),
    refresh: jest.fn(),
  }),
  usePhotoLibraryPermission: () => ({
    openAppSettings: mockOpenAppSettings,
    status: 'blocked',
    isGranted: false,
    isLimited: false,
    isDenied: false,
    isBlocked: true,
    isLoading: false,
    canProceed: false,
    checkPermission: jest.fn(),
    requestPermission: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  Camera: () => null,
  ImageIcon: () => null,
  AlertCircle: () => null,
}));

describe('PermissionDeniedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('camera permission', () => {
    it('should render camera denied content', () => {
      render(<PermissionDeniedScreen />);

      expect(screen.getByText('Camera Access Required')).toBeTruthy();
      expect(screen.getByText(/Camera access has been denied/)).toBeTruthy();
    });

    it('should render Open Settings and Go Back buttons', () => {
      render(<PermissionDeniedScreen />);

      expect(screen.getByTestId('permission-denied-settings-button')).toBeTruthy();
      expect(screen.getByTestId('permission-denied-back-button')).toBeTruthy();
    });

    it('should call openAppSettings when Open Settings is pressed', async () => {
      mockOpenAppSettings.mockResolvedValue(undefined);

      render(<PermissionDeniedScreen />);

      fireEvent.press(screen.getByTestId('permission-denied-settings-button'));

      await waitFor(() => {
        expect(mockOpenAppSettings).toHaveBeenCalled();
      });
    });

    it('should go back when Go Back is pressed', () => {
      render(<PermissionDeniedScreen />);

      fireEvent.press(screen.getByTestId('permission-denied-back-button'));

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('photo library permission', () => {
    beforeEach(() => {
      // Override route params for photo library
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
        params: { permissionType: 'photoLibrary' },
      });
    });

    it('should render photo library denied content', () => {
      render(<PermissionDeniedScreen />);

      expect(screen.getByText('Photo Library Access Required')).toBeTruthy();
      expect(screen.getByText(/Photo library access has been denied/)).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have accessible Open Settings button', () => {
      render(<PermissionDeniedScreen />);

      const settingsButton = screen.getByTestId('permission-denied-settings-button');

      expect(settingsButton.props.accessibilityRole).toBe('button');
      expect(settingsButton.props.accessibilityLabel).toBeTruthy();
      expect(settingsButton.props.accessibilityHint).toBeTruthy();
    });

    it('should have accessible Go Back button', () => {
      render(<PermissionDeniedScreen />);

      const backButton = screen.getByTestId('permission-denied-back-button');

      expect(backButton.props.accessibilityRole).toBe('button');
      expect(backButton.props.accessibilityLabel).toBeTruthy();
      expect(backButton.props.accessibilityHint).toBeTruthy();
    });
  });

  describe('default permission type', () => {
    beforeEach(() => {
      // Override route params to have no permissionType
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
        params: {},
      });
    });

    it('should default to camera permission type', () => {
      render(<PermissionDeniedScreen />);

      expect(screen.getByText('Camera Access Required')).toBeTruthy();
    });
  });
});
