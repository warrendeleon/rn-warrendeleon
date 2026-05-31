/**
 * Tests for usePhotoLibraryPermission hook
 *
 * EAA compliance: Tests permission states for photo library access
 * Includes iOS 14+ LIMITED access support
 */

import { Linking, Platform } from 'react-native';
import { check, openSettings, request, RESULTS } from 'react-native-permissions';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { isE2EMockEnabled } from '@app/config/e2e';
import { logError } from '@app/utils/logger';

import { usePhotoLibraryPermission } from '../usePhotoLibraryPermission';

// Mock dependencies
jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  openSettings: jest.fn(),
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

jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(),
}));

jest.mock('@app/utils/logger', () => ({
  logError: jest.fn(),
}));

const mockCheck = check as jest.MockedFunction<typeof check>;
const mockRequest = request as jest.MockedFunction<typeof request>;
const mockOpenSettings = openSettings as jest.MockedFunction<typeof openSettings>;
const mockIsE2EMockEnabled = isE2EMockEnabled as jest.MockedFunction<typeof isE2EMockEnabled>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe('usePhotoLibraryPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsE2EMockEnabled.mockReturnValue(false);
    mockCheck.mockResolvedValue(RESULTS.DENIED);
  });

  describe('initial state', () => {
    it('starts with isLoading: true', async () => {
      mockCheck.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(RESULTS.GRANTED), 100))
      );

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      expect(result.current.isLoading).toBe(true);

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('status is null initially before check completes', async () => {
      mockCheck.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(RESULTS.GRANTED), 100))
      );

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      expect(result.current.status).toBeNull();
    });
  });

  describe('checkPermission', () => {
    it('returns GRANTED and sets isGranted: true', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(result.current.isGranted).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });

    it('returns DENIED and sets isDenied: true', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.status).toBe(RESULTS.DENIED);
      expect(result.current.isDenied).toBe(true);
      expect(result.current.canProceed).toBe(false);
    });

    it('returns BLOCKED and sets isBlocked: true', async () => {
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.status).toBe(RESULTS.BLOCKED);
      expect(result.current.isBlocked).toBe(true);
      expect(result.current.canProceed).toBe(false);
    });

    it('handles errors and sets UNAVAILABLE', async () => {
      const error = new Error('Permission check failed');
      mockCheck.mockRejectedValue(error);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.status).toBe(RESULTS.UNAVAILABLE);
      expect(mockLogError).toHaveBeenCalledWith('Failed to check photo library permission', error);
    });

    it('E2E mock returns GRANTED without calling check', async () => {
      mockIsE2EMockEnabled.mockReturnValue(true);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(result.current.isGranted).toBe(true);
      expect(mockCheck).not.toHaveBeenCalled();
    });
  });

  describe('iOS LIMITED access (iOS 14+)', () => {
    it('isLimited: true when status === LIMITED', async () => {
      mockCheck.mockResolvedValue(RESULTS.LIMITED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.status).toBe(RESULTS.LIMITED);
      expect(result.current.isLimited).toBe(true);
      expect(result.current.isGranted).toBe(false);
    });

    it('canProceed: true when LIMITED (iOS 14+ behaviour)', async () => {
      mockCheck.mockResolvedValue(RESULTS.LIMITED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // LIMITED should allow proceeding for profile picture selection
      expect(result.current.canProceed).toBe(true);
      expect(result.current.isLimited).toBe(true);
    });

    it('distinguishes LIMITED from GRANTED', async () => {
      mockCheck.mockResolvedValue(RESULTS.LIMITED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // LIMITED and GRANTED are different states
      expect(result.current.isLimited).toBe(true);
      expect(result.current.isGranted).toBe(false);
      // But both allow proceeding
      expect(result.current.canProceed).toBe(true);
    });
  });

  describe('requestPermission', () => {
    it('returns GRANTED after user approves', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.GRANTED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      let requestResult: string;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(RESULTS.GRANTED);
      expect(result.current.status).toBe(RESULTS.GRANTED);
      expect(result.current.isGranted).toBe(true);
    });

    it('returns LIMITED after user selects specific photos (iOS 14+)', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.LIMITED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      let requestResult: string;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(RESULTS.LIMITED);
      expect(result.current.isLimited).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });

    it('returns DENIED after user denies', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.DENIED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      let requestResult: string;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(RESULTS.DENIED);
      expect(result.current.isDenied).toBe(true);
    });

    it('returns BLOCKED after permanent deny', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      mockRequest.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      let requestResult: string;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(RESULTS.BLOCKED);
      expect(result.current.isBlocked).toBe(true);
    });

    it('handles errors gracefully', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);
      const error = new Error('Request failed');
      mockRequest.mockRejectedValue(error);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      let requestResult: string;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(RESULTS.UNAVAILABLE);
      expect(mockLogError).toHaveBeenCalledWith(
        'Failed to request photo library permission',
        error
      );
    });

    it('E2E mock returns GRANTED without calling request', async () => {
      mockIsE2EMockEnabled.mockReturnValue(true);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      let requestResult: string;
      await act(async () => {
        requestResult = await result.current.requestPermission();
      });

      expect(requestResult!).toBe(RESULTS.GRANTED);
      expect(mockRequest).not.toHaveBeenCalled();
    });
  });

  describe('derived state', () => {
    it('isGranted: true when status === GRANTED', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.isGranted).toBe(true);
      expect(result.current.isLimited).toBe(false);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(false);
    });

    it('isDenied: true when status === DENIED', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.isGranted).toBe(false);
      expect(result.current.isLimited).toBe(false);
      expect(result.current.isDenied).toBe(true);
      expect(result.current.isBlocked).toBe(false);
    });

    it('isBlocked: true when status === BLOCKED', async () => {
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.isGranted).toBe(false);
      expect(result.current.isLimited).toBe(false);
      expect(result.current.isDenied).toBe(false);
      expect(result.current.isBlocked).toBe(true);
    });

    it('canProceed: true when GRANTED', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.canProceed).toBe(true);
    });

    it('canProceed: true when LIMITED', async () => {
      mockCheck.mockResolvedValue(RESULTS.LIMITED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.canProceed).toBe(true);
    });

    it('canProceed: false when DENIED', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.canProceed).toBe(false);
    });

    it('canProceed: false when BLOCKED', async () => {
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.canProceed).toBe(false);
    });
  });

  describe('openAppSettings', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    });

    it('calls Linking.openURL on iOS', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios' });
      const mockOpenURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await act(async () => {
        await result.current.openAppSettings();
      });

      expect(mockOpenURL).toHaveBeenCalledWith('app-settings:');
      mockOpenURL.mockRestore();
    });

    it('calls openSettings on Android', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'android' });
      mockOpenSettings.mockResolvedValue(undefined);
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await act(async () => {
        await result.current.openAppSettings();
      });

      expect(mockOpenSettings).toHaveBeenCalled();
    });

    it('handles errors when opening settings', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios' });
      const error = new Error('Failed to open settings');
      const mockOpenURL = jest.spyOn(Linking, 'openURL').mockRejectedValue(error);
      mockCheck.mockResolvedValue(RESULTS.BLOCKED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      await act(async () => {
        await result.current.openAppSettings();
      });

      expect(mockLogError).toHaveBeenCalledWith('Failed to open app settings', error);
      mockOpenURL.mockRestore();
    });
  });

  describe('refresh', () => {
    it('calls checkPermission and updates state', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.isDenied).toBe(true);

      // Simulate permission change in settings
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.isGranted).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });

    it('can transition from DENIED to LIMITED after settings change', async () => {
      mockCheck.mockResolvedValue(RESULTS.DENIED);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      expect(result.current.isDenied).toBe(true);
      expect(result.current.canProceed).toBe(false);

      // User enables limited access in settings
      mockCheck.mockResolvedValue(RESULTS.LIMITED);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.isLimited).toBe(true);
      expect(result.current.canProceed).toBe(true);
    });
  });

  describe('mount behaviour', () => {
    it('checks permission on mount', async () => {
      mockCheck.mockResolvedValue(RESULTS.GRANTED);

      await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(mockCheck).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('security', () => {
    it('does not expose sensitive permission data in error states', async () => {
      const error = new Error('Permission check failed');
      mockCheck.mockRejectedValue(error);

      const { result } = await renderHook(() => usePhotoLibraryPermission());

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      // Status should be UNAVAILABLE, not expose error details
      expect(result.current.status).toBe(RESULTS.UNAVAILABLE);
      // Error should be logged but not exposed to UI
      expect(mockLogError).toHaveBeenCalled();
    });
  });
});
