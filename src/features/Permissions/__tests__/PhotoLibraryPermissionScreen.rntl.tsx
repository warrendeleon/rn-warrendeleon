/**
 * Tests for Photo Library Permission Screen
 *
 * Tests the pre-permission explanation screen for photo library access.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

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

  it('should render the screen with correct content', () => {
    render(<PhotoLibraryPermissionScreen />);

    expect(screen.getByText('Photo Library Access Required')).toBeTruthy();
    expect(
      screen.getByText('To choose a profile photo, we need access to your photo library.')
    ).toBeTruthy();
    expect(screen.getByText(/Select a photo from your library/)).toBeTruthy();
    expect(screen.getByText(/Face detection happens on your device/)).toBeTruthy();
    // iOS-specific bullet is conditionally rendered based on Platform.OS
    expect(screen.getByText(/We never see your other photos/)).toBeTruthy();
  });

  it('should render Continue and Skip buttons', () => {
    render(<PhotoLibraryPermissionScreen />);

    expect(screen.getByTestId('photo-library-permission-continue-button')).toBeTruthy();
    expect(screen.getByTestId('photo-library-permission-skip-button')).toBeTruthy();
  });

  it('should go back when Skip is pressed', () => {
    render(<PhotoLibraryPermissionScreen />);

    fireEvent.press(screen.getByTestId('photo-library-permission-skip-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should request permission and go back when granted', async () => {
    mockRequestPermission.mockResolvedValue('granted');

    render(<PhotoLibraryPermissionScreen />);

    fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should go back when limited (iOS 14+)', async () => {
    mockRequestPermission.mockResolvedValue('limited');

    render(<PhotoLibraryPermissionScreen />);

    fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should navigate to PermissionDenied when denied', async () => {
    mockRequestPermission.mockResolvedValue('denied');

    render(<PhotoLibraryPermissionScreen />);

    fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('PermissionDenied', {
        permissionType: 'photoLibrary',
      });
    });
  });

  it('should navigate to PermissionDenied when blocked', async () => {
    mockRequestPermission.mockResolvedValue('blocked');

    render(<PhotoLibraryPermissionScreen />);

    fireEvent.press(screen.getByTestId('photo-library-permission-continue-button'));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('PermissionDenied', {
        permissionType: 'photoLibrary',
      });
    });
  });

  it('should have accessible Continue button', () => {
    render(<PhotoLibraryPermissionScreen />);

    const continueButton = screen.getByTestId('photo-library-permission-continue-button');

    expect(continueButton.props.accessibilityRole).toBe('button');
    expect(continueButton.props.accessibilityLabel).toBeTruthy();
    expect(continueButton.props.accessibilityHint).toBeTruthy();
  });

  it('should have accessible Skip button', () => {
    render(<PhotoLibraryPermissionScreen />);

    const skipButton = screen.getByTestId('photo-library-permission-skip-button');

    expect(skipButton.props.accessibilityRole).toBe('button');
    expect(skipButton.props.accessibilityLabel).toBeTruthy();
    expect(skipButton.props.accessibilityHint).toBeTruthy();
  });
});
