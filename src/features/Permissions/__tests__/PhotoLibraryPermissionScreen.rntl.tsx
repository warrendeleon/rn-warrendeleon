/**
 * Tests for Photo Library Permission Screen
 *
 * Tests the pre-permission explanation screen for photo library access.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { expectMinTouchTarget } from '@app/test-utils';

import { PhotoLibraryPermissionScreen } from '../PhotoLibraryPermissionScreen';

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

// Mock usePhotoLibraryPermission hook
const mockRequestPermission = jest.fn();

jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => 'light',
  useCameraPermission: () => ({
    requestPermission: jest.fn(),
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
    requestPermission: mockRequestPermission,
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
  ImageIcon: () => null,
}));

describe('PhotoLibraryPermissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays photo library access title, explanation, and privacy assurances', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    expect(screen.getByText('Photo Library Access Required')).toBeOnTheScreen();
    expect(
      screen.getByText('To choose a profile photo, we need access to your photo library.')
    ).toBeOnTheScreen();
    expect(screen.getByText(/Select a photo from your library/)).toBeOnTheScreen();
    expect(screen.getByText(/Face detection happens on your device/)).toBeOnTheScreen();
    // iOS-specific bullet is conditionally rendered based on Platform.OS
    expect(screen.getByText(/We never see your other photos/)).toBeOnTheScreen();
  });

  it('displays Continue and Skip action buttons', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    expect(screen.getByTestId('photo-library-permission-continue-button')).toBeOnTheScreen();
    expect(screen.getByTestId('photo-library-permission-skip-button')).toBeOnTheScreen();
  });

  it('should go back when Skip is pressed', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    await fireEvent.press(screen.getByTestId('photo-library-permission-skip-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should request permission and go back when granted', async () => {
    mockRequestPermission.mockResolvedValue('granted');

    await render(<PhotoLibraryPermissionScreen />);

    await fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

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

  it('should go back when limited (iOS 14+)', async () => {
    mockRequestPermission.mockResolvedValue('limited');

    await render(<PhotoLibraryPermissionScreen />);

    await fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

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

    await render(<PhotoLibraryPermissionScreen />);

    await fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

    await waitFor(
      () => {
        expect(mockRequestPermission).toHaveBeenCalled();
      },
      { timeout: 3000, interval: 100 }
    );

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('PermissionDenied', {
          permissionType: 'photoLibrary',
        });
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should navigate to PermissionDenied when blocked', async () => {
    mockRequestPermission.mockResolvedValue('blocked');

    await render(<PhotoLibraryPermissionScreen />);

    await fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('PermissionDenied', {
          permissionType: 'photoLibrary',
        });
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('should have accessible Continue button', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    const continueButton = screen.getByTestId('photo-library-permission-continue-button');

    expect(continueButton.props.accessibilityRole).toBe('button');
    expect(continueButton.props.accessibilityLabel).toBe('Continue');
    expect(continueButton.props.accessibilityHint).toBe(
      'Requests photo library permission from your device'
    );
  });

  it('should have accessible Skip button', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    const skipButton = screen.getByTestId('photo-library-permission-skip-button');

    expect(skipButton.props.accessibilityRole).toBe('button');
    expect(skipButton.props.accessibilityLabel).toBe('Skip for now');
    expect(skipButton.props.accessibilityHint).toBe(
      'Returns to the previous screen without requesting photo library access'
    );
  });
});

describe('PhotoLibraryPermissionScreen EAA Accessibility Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('continue button has accessible touch target', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    expectMinTouchTarget(screen.getByTestId('photo-library-permission-continue-button'));
  });

  it('skip button has accessible touch target', async () => {
    await render(<PhotoLibraryPermissionScreen />);

    expectMinTouchTarget(screen.getByTestId('photo-library-permission-skip-button'));
  });
});
