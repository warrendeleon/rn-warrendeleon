/**
 * Tests for Camera Permission Screen
 *
 * Tests the pre-permission explanation screen for camera access.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { expectMinTouchTarget } from '@app/test-utils';

import { CameraPermissionScreen } from '../CameraPermissionScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    replace: mockReplace,
  }),
}));

// Mock useCameraPermission hook
const mockRequestPermission = jest.fn();

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => 'light',
  useCameraPermission: () => ({
    requestPermission: mockRequestPermission,
    status: null,
    isGranted: false,
    isDenied: false,
    isBlocked: false,
    isLoading: false,
    canProceed: false,
    checkPermission: jest.fn(),
    openAppSettings: jest.fn(),
    refresh: jest.fn(),
  }),
  usePhotoLibraryPermission: () => ({
    requestPermission: jest.fn(),
    status: null,
    isGranted: false,
    isLimited: false,
    isDenied: false,
    isBlocked: false,
    isLoading: false,
    canProceed: false,
    checkPermission: jest.fn(),
    openAppSettings: jest.fn(),
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
}));

describe('CameraPermissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays camera access title, explanation, and privacy assurances', () => {
    render(<CameraPermissionScreen />);

    expect(screen.getByText('Camera Access Required')).toBeOnTheScreen();
    expect(
      screen.getByText('To take a profile photo, we need access to your camera.')
    ).toBeOnTheScreen();
    expect(screen.getByText(/Take a photo for your profile/)).toBeOnTheScreen();
    expect(screen.getByText(/Face detection happens on your device/)).toBeOnTheScreen();
    expect(screen.getByText(/Photos are not stored without your consent/)).toBeOnTheScreen();
    expect(screen.getByText(/Face detection happens locally/)).toBeOnTheScreen();
  });

  it('displays Continue and Skip action buttons', () => {
    render(<CameraPermissionScreen />);

    expect(screen.getByTestId('camera-permission-continue-button')).toBeOnTheScreen();
    expect(screen.getByTestId('camera-permission-skip-button')).toBeOnTheScreen();
  });

  it('should go back when Skip is pressed', () => {
    render(<CameraPermissionScreen />);

    fireEvent.press(screen.getByTestId('camera-permission-skip-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should request permission and go back when granted', async () => {
    mockRequestPermission.mockResolvedValue('granted');

    render(<CameraPermissionScreen />);

    fireEvent.press(screen.getByTestId('camera-permission-continue-button'));

    await waitFor(
      () => {
        expect(mockRequestPermission).toHaveBeenCalled();
      },
      { timeout: 3000, interval: 100 }
    );

    await waitFor(
      () => {
        expect(mockGoBack).toHaveBeenCalled();
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should navigate to PermissionDenied when denied', async () => {
    mockRequestPermission.mockResolvedValue('denied');

    render(<CameraPermissionScreen />);

    fireEvent.press(screen.getByTestId('camera-permission-continue-button'));

    await waitFor(
      () => {
        expect(mockRequestPermission).toHaveBeenCalled();
      },
      { timeout: 3000, interval: 100 }
    );

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('PermissionDenied', { permissionType: 'camera' });
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should navigate to PermissionDenied when blocked', async () => {
    mockRequestPermission.mockResolvedValue('blocked');

    render(<CameraPermissionScreen />);

    fireEvent.press(screen.getByTestId('camera-permission-continue-button'));

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('PermissionDenied', { permissionType: 'camera' });
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should have accessible Continue button', () => {
    render(<CameraPermissionScreen />);

    const continueButton = screen.getByTestId('camera-permission-continue-button');

    expect(continueButton.props.accessibilityRole).toBe('button');
    expect(continueButton.props.accessibilityLabel).toBe('Continue');
    expect(continueButton.props.accessibilityHint).toBe(
      'Requests camera permission from your device'
    );
  });

  it('should have accessible Skip button', () => {
    render(<CameraPermissionScreen />);

    const skipButton = screen.getByTestId('camera-permission-skip-button');

    expect(skipButton.props.accessibilityRole).toBe('button');
    expect(skipButton.props.accessibilityLabel).toBe('Skip for now');
    expect(skipButton.props.accessibilityHint).toBe(
      'Returns to the previous screen without requesting camera access'
    );
  });
});

describe('CameraPermissionScreen EAA Accessibility Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('continue button has accessible touch target', () => {
    render(<CameraPermissionScreen />);

    expectMinTouchTarget(screen.getByTestId('camera-permission-continue-button'));
  });

  it('skip button has accessible touch target', () => {
    render(<CameraPermissionScreen />);

    expectMinTouchTarget(screen.getByTestId('camera-permission-skip-button'));
  });
});
