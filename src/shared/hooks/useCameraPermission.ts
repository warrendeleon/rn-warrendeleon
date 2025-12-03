/**
 * Camera Permission Hook
 *
 * Manages camera permission state for profile picture capture.
 * Handles check, request, and settings navigation for denied permissions.
 *
 * Features:
 * - Cross-platform (iOS/Android)
 * - E2E mock support
 * - Settings deep link for blocked permissions
 */

import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  type PermissionStatus,
  request,
  RESULTS,
} from 'react-native-permissions';

import { isE2EMockEnabled } from '@app/config/e2e';
import { logError } from '@app/utils/logger';

/** Camera permission state */
export interface CameraPermissionState {
  /** Current permission status */
  status: PermissionStatus | null;
  /** Whether camera access is granted */
  isGranted: boolean;
  /** Whether permission is denied but can be requested */
  isDenied: boolean;
  /** Whether permission is permanently blocked */
  isBlocked: boolean;
  /** Whether permission check is in progress */
  isLoading: boolean;
  /** Whether the user can proceed with camera access */
  canProceed: boolean;
}

/** Camera permission actions */
export interface CameraPermissionActions {
  /** Check current permission status */
  checkPermission: () => Promise<PermissionStatus>;
  /** Request permission from user */
  requestPermission: () => Promise<PermissionStatus>;
  /** Open app settings to change permission */
  openAppSettings: () => Promise<void>;
  /** Refresh permission status */
  refresh: () => Promise<void>;
}

/** Combined hook return type */
export type UseCameraPermissionResult = CameraPermissionState & CameraPermissionActions;

/** Platform-specific camera permission */
const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
  default: PERMISSIONS.IOS.CAMERA,
});

/**
 * Hook for managing camera permission
 *
 * @returns CameraPermissionState & CameraPermissionActions
 *
 * @example
 * ```tsx
 * const { isGranted, isDenied, isBlocked, requestPermission, openAppSettings } = useCameraPermission();
 *
 * const handleTakePhoto = async () => {
 *   if (isGranted) {
 *     openCamera();
 *   } else if (isDenied) {
 *     const status = await requestPermission();
 *     if (status === RESULTS.GRANTED) {
 *       openCamera();
 *     }
 *   } else if (isBlocked) {
 *     showPermissionDeniedScreen();
 *   }
 * };
 * ```
 */
export function useCameraPermission(): UseCameraPermissionResult {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const isGranted = status === RESULTS.GRANTED;
  const isDenied = status === RESULTS.DENIED;
  const isBlocked = status === RESULTS.BLOCKED;
  const canProceed = isGranted;

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    // E2E mock: Return granted status
    if (isE2EMockEnabled()) {
      setStatus(RESULTS.GRANTED);
      setIsLoading(false);
      return RESULTS.GRANTED;
    }

    try {
      setIsLoading(true);
      const result = await check(CAMERA_PERMISSION);
      setStatus(result);
      return result;
    } catch (error) {
      logError('Failed to check camera permission', error);
      setStatus(RESULTS.UNAVAILABLE);
      return RESULTS.UNAVAILABLE;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request permission from user
   */
  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    // E2E mock: Return granted status
    if (isE2EMockEnabled()) {
      setStatus(RESULTS.GRANTED);
      return RESULTS.GRANTED;
    }

    try {
      setIsLoading(true);
      const result = await request(CAMERA_PERMISSION);
      setStatus(result);
      return result;
    } catch (error) {
      logError('Failed to request camera permission', error);
      return RESULTS.UNAVAILABLE;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Open app settings to change permission
   * Note: We can only open the app's settings page, not the specific permission toggle
   */
  const openAppSettings = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS === 'ios') {
        // Opens the app's settings page in iOS Settings
        await Linking.openURL('app-settings:');
      } else {
        // Opens the app's details page in Android Settings
        await openSettings();
      }
    } catch (error) {
      logError('Failed to open app settings', error);
    }
  }, []);

  /**
   * Refresh permission status
   */
  const refresh = useCallback(async (): Promise<void> => {
    await checkPermission();
  }, [checkPermission]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    // State
    status,
    isGranted,
    isDenied,
    isBlocked,
    isLoading,
    canProceed,
    // Actions
    checkPermission,
    requestPermission,
    openAppSettings,
    refresh,
  };
}
