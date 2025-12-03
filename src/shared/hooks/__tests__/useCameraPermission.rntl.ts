/**
 * Tests for Camera Permission Hook
 *
 * Tests permission check, request, and settings navigation.
 * Native permission operations are mocked in unit tests.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useCameraPermission } from '../useCameraPermission';

// Mock react-native-permissions
const mockCheck = jest.fn();
const mockRequest = jest.fn();
const mockOpenSettings = jest.fn();

jest.mock('react-native-permissions', () => ({
  check: (...args: unknown[]) => mockCheck(...args),
  request: (...args: unknown[]) => mockRequest(...args),
  openSettings: (...args: unknown[]) => mockOpenSettings(...args),
  PERMISSIONS: {
    IOS: { CAMERA: 'ios.permission.CAMERA' },
    ANDROID: { CAMERA: 'android.permission.CAMERA' },
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

describe('useCameraPermission', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    mockCheck.mockResolvedValue('granted');
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      mockCheck.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useCameraPermission());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.status).toBeNull();
    });

    it('should check permission on mount', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.CAMERA');
    });
  });

  describe('permission states', () => {
    it('should set isGranted true when permission is granted', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.canProceed).toBe(true);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });

    it('should set isDenied true when permission is denied', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isDenied).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.canProceed).toBe(false);
    });

    it('should set isBlocked true when permission is blocked', async () => {
      mockCheck.mockResolvedValue('blocked');

      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isBlocked).toBe(true);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.canProceed).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should return permission status', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCheck.mockResolvedValue('denied');

      let status: string | undefined;
      await act(async () => {
        status = await result.current.checkPermission();
      });

      expect(status).toBe('denied');
      expect(result.current.isDenied).toBe(true);
    });

    it('should handle check errors gracefully', async () => {
      mockCheck.mockResolvedValue('granted');

      const { result } = renderHook(() => useCameraPermission());

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
    it('should request permission and update state', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => useCameraPermission());

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
      expect(mockRequest).toHaveBeenCalledWith('ios.permission.CAMERA');
    });

    it('should handle request errors gracefully', async () => {
      mockCheck.mockResolvedValue('denied');

      const { result } = renderHook(() => useCameraPermission());

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

      const { result } = renderHook(() => useCameraPermission());

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

      const { result } = renderHook(() => useCameraPermission());

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

      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isDenied).toBe(true);

      mockCheck.mockResolvedValue('granted');

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.isGranted).toBe(true);
    });
  });

  describe('E2E mock behaviour', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('should return granted status when E2E mock is enabled', async () => {
      const { result } = renderHook(() => useCameraPermission());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.canProceed).toBe(true);
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('should return granted on request when E2E mock is enabled', async () => {
      const { result } = renderHook(() => useCameraPermission());

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
