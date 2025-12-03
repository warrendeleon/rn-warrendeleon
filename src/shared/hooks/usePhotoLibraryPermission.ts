/**
 * Photo Library Permission Hook
 *
 * Manages photo library permission state for profile picture selection.
 * Handles check, request, and settings navigation for denied permissions.
 *
 * Features:
 * - Cross-platform (iOS/Android)
 * - iOS LIMITED access support (iOS 14+) - treated as acceptable
 * - E2E mock support
 * - Settings deep link for blocked permissions
 *
 * iOS Permission States:
 * - GRANTED: Full photo library access
 * - LIMITED: User selected specific photos (acceptable for profile picture)
 * - DENIED: User denied, can request again
 * - BLOCKED: User denied permanently
 *
 * Android Permission States:
 * - GRANTED: Full media access
 * - DENIED: User denied, can request again
 * - BLOCKED: User denied permanently
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

/** Photo library permission state */
export interface PhotoLibraryPermissionState {
  /** Current permission status */
  status: PermissionStatus | null;
  /** Whether full photo library access is granted */
  isGranted: boolean;
  /** Whether limited photo access is granted (iOS 14+) */
  isLimited: boolean;
  /** Whether permission is denied but can be requested */
  isDenied: boolean;
  /** Whether permission is permanently blocked */
  isBlocked: boolean;
  /** Whether permission check is in progress */
  isLoading: boolean;
  /** Whether the user can proceed with photo selection (GRANTED or LIMITED) */
  canProceed: boolean;
}

/** Photo library permission actions */
export interface PhotoLibraryPermissionActions {
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
export type UsePhotoLibraryPermissionResult = PhotoLibraryPermissionState &
  PhotoLibraryPermissionActions;

/**
 * Get platform-specific photo library permission
 *
 * iOS: Uses PHOTO_LIBRARY permission
 * Android 13+: Uses READ_MEDIA_IMAGES (granular media permissions)
 * Android 12-: Uses READ_EXTERNAL_STORAGE
 */
function getPhotoLibraryPermission() {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.PHOTO_LIBRARY;
  }

  // Android 13+ (API 33+) uses granular media permissions
  // Android 12 and below uses READ_EXTERNAL_STORAGE
  // react-native-permissions handles this automatically via the platform check
  return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
}

/**
 * Hook for managing photo library permission
 *
 * @returns PhotoLibraryPermissionState & PhotoLibraryPermissionActions
 *
 * @example
 * ```tsx
 * const {
 *   isGranted,
 *   isLimited,
 *   isDenied,
 *   isBlocked,
 *   canProceed,
 *   requestPermission,
 *   openAppSettings
 * } = usePhotoLibraryPermission();
 *
 * const handleSelectPhoto = async () => {
 *   if (canProceed) {
 *     // Both GRANTED and LIMITED allow photo selection
 *     openPhotoPicker();
 *   } else if (isDenied) {
 *     const status = await requestPermission();
 *     if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
 *       openPhotoPicker();
 *     }
 *   } else if (isBlocked) {
 *     showPermissionDeniedScreen();
 *   }
 * };
 * ```
 */
export function usePhotoLibraryPermission(): UsePhotoLibraryPermissionResult {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const isGranted = status === RESULTS.GRANTED;
  const isLimited = status === RESULTS.LIMITED;
  const isDenied = status === RESULTS.DENIED;
  const isBlocked = status === RESULTS.BLOCKED;
  // LIMITED is acceptable for profile picture selection on iOS
  const canProceed = isGranted || isLimited;

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
      const permission = getPhotoLibraryPermission();
      const result = await check(permission);
      setStatus(result);
      return result;
    } catch (error) {
      logError('Failed to check photo library permission', error);
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
      const permission = getPhotoLibraryPermission();
      const result = await request(permission);
      setStatus(result);
      return result;
    } catch (error) {
      logError('Failed to request photo library permission', error);
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
    isLimited,
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
