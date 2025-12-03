/**
 * Tests for Photo Library Permission Hook
 *
 * Tests permission check, request, and settings navigation.
 * Includes iOS LIMITED access handling (iOS 14+).
 * Native permission operations are mocked in unit tests.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { usePhotoLibraryPermission } from '../usePhotoLibraryPermission';

// Mock react-native-permissions
const mockCheck = jest.fn();
const mockRequest = jest.fn();
const mockOpenSettings = jest.fn();

jest.mock('react-native-permissions', () => ({
  check: (...args: unknown[]) => mockCheck(...args),
  request: (...args: unknown[]) => mockRequest(...args),
  openSettings: (...args: unknown[]) => mockOpenSettings(...args),
  PERMISSIONS: {
    IOS: { PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY' },
    ANDROID: { READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES' },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
    LIMITED: 'limited',
  },
}));

// Mock React Native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn(obj => obj.ios) },
  Linking: { openURL: jest.fn() },
}));

// Mock E2E config
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

// Mock logger
jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
}));

describe('usePhotoLibraryPermission', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    mockCheck.mockResolvedValue('granted');
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      mockCheck.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => usePhotoLibraryPermission());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.status).toBeNull();
    });

    it('should check permission on mount', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.PHOTO_LIBRARY');
    });
  });

  describe('permission states', () => {
    it('should set isGranted true when permission is granted', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.isLimited).toBe(false);
      expect(result.current.canProceed).toBe(true);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });

    it('should set isLimited true and canProceed true for LIMITED access (iOS 14+)', async () => {
      mockCheck.mockResolvedValue('limited');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLimited).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.canProceed).toBe(true); // LIMITED is acceptable
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });

    it('should set isDenied true when permission is denied', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isDenied).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isLimited).toBe(false);
      expect(result.current.canProceed).toBe(false);
    });

    it('should set isBlocked true when permission is blocked', async () => {
      mockCheck.mockResolvedValue('blocked');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isLimited).toBe(false);
      expect(result.current.canProceed).toBe(false);
    });
  });

  describe('canProceed logic', () => {
    it('should allow proceeding when GRANTED', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canProceed).toBe(true);
    });

    it('should allow proceeding when LIMITED (iOS 14+)', async () => {
      mockCheck.mockResolvedValue('limited');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canProceed).toBe(true);
    });

    it('should NOT allow proceeding when DENIED', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canProceed).toBe(false);
    });

    it('should NOT allow proceeding when BLOCKED', async () => {
      mockCheck.mockResolvedValue('blocked');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.canProceed).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should return permission status', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCheck.mockResolvedValue('limited');

      let status: string | undefined;
      await act(async () => {
        status = await result.current.checkPermission();
      });

      expect(status).toBe('limited');
      expect(result.current.isLimited).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });

    it('should handle check errors gracefully', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCheck.mockRejectedValue(new Error('Permission check failed'));

      let status: string | undefined;
      await act(async () => {
        status = await result.current.checkPermission();
      });

      expect(status).toBe('unavailable');
    });
  });

  describe('requestPermission', () => {
    it('should request permission and update state to GRANTED', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockRequest.mockResolvedValue('granted');

      let status: string | undefined;
      await act(async () => {
        status = await result.current.requestPermission();
      });

      expect(status).toBe('granted');
      expect(result.current.isGranted).toBe(true);
      expect(result.current.canProceed).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith('ios.permission.PHOTO_LIBRARY');
    });

    it('should request permission and update state to LIMITED', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockRequest.mockResolvedValue('limited');

      let status: string | undefined;
      await act(async () => {
        status = await result.current.requestPermission();
      });

      expect(status).toBe('limited');
      expect(result.current.isLimited).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });

    it('should handle request errors gracefully', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockRequest.mockRejectedValue(new Error('Request failed'));

      let status: string | undefined;
      await act(async () => {
        status = await result.current.requestPermission();
      });

      expect(status).toBe('unavailable');
    });
  });

  describe('openAppSettings', () => {
    it('should open iOS settings URL', async () => {
      const { Linking } = require('react-native');
      mockCheck.mockResolvedValue('blocked');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.openAppSettings();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
    });

    it('should handle settings open errors gracefully', async () => {
      const { Linking } = require('react-native');
      Linking.openURL.mockRejectedValue(new Error('Failed to open'));
      mockCheck.mockResolvedValue('blocked');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw
      await act(async () => {
        await result.current.openAppSettings();
      });
    });
  });

  describe('refresh', () => {
    it('should re-check permission status', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isDenied).toBe(true);
      expect(result.current.canProceed).toBe(false);

      mockCheck.mockResolvedValue('limited');

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.isLimited).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });
  });

  describe('E2E mock behaviour', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('should return granted status when E2E mock is enabled', async () => {
      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.canProceed).toBe(true);
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('should return granted on request when E2E mock is enabled', async () => {
      const { result } = renderHook(() => usePhotoLibraryPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let status: string | undefined;
      await act(async () => {
        status = await result.current.requestPermission();
      });

      expect(status).toBe('granted');
      expect(mockRequest).not.toHaveBeenCalled();
    });
  });
});
