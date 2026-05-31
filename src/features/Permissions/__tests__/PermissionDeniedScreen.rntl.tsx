/**
 * Tests for Permission Denied Screen
 *
 * Tests the permission denied screen for both camera and photo library.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { expectMinTouchTarget } from '@app/test-utils';

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
    it('should render camera denied content', async () => {
      await render(<PermissionDeniedScreen />);

      expect(screen.getByText('Camera Access Required')).toBeOnTheScreen();
      expect(screen.getByText(/Camera access has been denied/)).toBeOnTheScreen();
    });

    it('should render Open Settings and Go Back buttons', async () => {
      await render(<PermissionDeniedScreen />);

      expect(screen.getByTestId('permission-denied-settings-button')).toBeOnTheScreen();
      expect(screen.getByTestId('permission-denied-back-button')).toBeOnTheScreen();
    });

    it('should call openAppSettings when Open Settings is pressed', async () => {
      mockOpenAppSettings.mockResolvedValue(undefined);

      await render(<PermissionDeniedScreen />);

      await fireEvent.press(screen.getByTestId('permission-denied-settings-button'));

      await waitFor(
        () => {
          expect(mockOpenAppSettings).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should go back when Go Back is pressed', async () => {
      await render(<PermissionDeniedScreen />);

      await fireEvent.press(screen.getByTestId('permission-denied-back-button'));

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

    it('should render photo library denied content', async () => {
      await render(<PermissionDeniedScreen />);

      expect(screen.getByText('Photo Library Access Required')).toBeOnTheScreen();
      expect(screen.getByText(/Photo library access has been denied/)).toBeOnTheScreen();
    });
  });

  describe('accessibility', () => {
    it('should have accessible Open Settings button', async () => {
      await render(<PermissionDeniedScreen />);

      const settingsButton = screen.getByTestId('permission-denied-settings-button');

      expect(settingsButton.props.accessibilityRole).toBe('button');
      expect(settingsButton.props.accessibilityLabel).toBeDefined();
      expect(settingsButton.props.accessibilityHint).toBeDefined();
    });

    it('should have accessible Go Back button', async () => {
      await render(<PermissionDeniedScreen />);

      const backButton = screen.getByTestId('permission-denied-back-button');

      expect(backButton.props.accessibilityRole).toBe('button');
      expect(backButton.props.accessibilityLabel).toBeDefined();
      expect(backButton.props.accessibilityHint).toBeDefined();
    });
  });

  describe('default permission type', () => {
    beforeEach(() => {
      // Override route params to have no permissionType
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
        params: {},
      });
    });

    it('should default to camera permission type', async () => {
      await render(<PermissionDeniedScreen />);

      expect(screen.getByText('Camera Access Required')).toBeOnTheScreen();
    });
  });
});

describe('PermissionDeniedScreen EAA Accessibility Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('open settings button has accessible touch target', async () => {
    await render(<PermissionDeniedScreen />);

    expectMinTouchTarget(screen.getByTestId('permission-denied-settings-button'));
  });

  it('go back button has accessible touch target', async () => {
    await render(<PermissionDeniedScreen />);

    expectMinTouchTarget(screen.getByTestId('permission-denied-back-button'));
  });
});
