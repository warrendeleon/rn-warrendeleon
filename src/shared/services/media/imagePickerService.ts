/**
 * Image Picker Service
 *
 * Provides camera and photo library access for profile picture selection.
 * Uses react-native-image-crop-picker for native image selection with cropping.
 *
 * Features:
 * - Camera capture with square cropping (1:1)
 * - Photo library selection with square cropping
 * - Built-in UI for cropping
 * - E2E mock support for testing
 *
 * Note: Native camera/library UI cannot be tested with Detox.
 * E2E tests mock the entire image flow.
 */

import { Image as RNImage } from 'react-native';
import ImagePicker, { type Image, type Options } from 'react-native-image-crop-picker';

import mockProfileImage from '@app/assets/img/profile-11.jpg';
import { isE2EMockEnabled } from '@app/config/e2e';
import { logDebug, logError } from '@app/utils/logger';

/** Image selection result */
export interface ImagePickerResult {
  /** Whether the image was successfully selected */
  success: boolean;
  /** Error if selection failed */
  error?: string;
  /** Local file URI of the selected image */
  uri?: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** MIME type of the image */
  mime?: string;
  /** File size in bytes */
  size?: number;
}

/** Default picker options for profile pictures */
const DEFAULT_PROFILE_PICTURE_OPTIONS: Options = {
  width: 800,
  height: 800,
  cropping: true,
  cropperCircleOverlay: true,
  cropperToolbarTitle: 'Adjust Photo',
  cropperToolbarColor: '#FFFFFF',
  cropperActiveWidgetColor: '#0066FF',
  compressImageQuality: 0.8,
  mediaType: 'photo',
  includeBase64: false,
  includeExif: false, // Privacy: don't include EXIF data
};

/**
 * Get E2E mock result with resolved bundled asset URI
 */
function getE2EMockResult(): ImagePickerResult {
  const resolvedAsset = RNImage.resolveAssetSource(mockProfileImage);
  return {
    success: true,
    uri: resolvedAsset.uri,
    width: resolvedAsset.width || 800,
    height: resolvedAsset.height || 800,
    mime: 'image/jpeg',
    size: 150000,
  };
}

/**
 * Transform react-native-image-crop-picker result to our format
 */
function transformPickerResult(image: Image): ImagePickerResult {
  return {
    success: true,
    uri: image.path,
    width: image.width,
    height: image.height,
    mime: image.mime,
    size: image.size,
  };
}

/**
 * Handle picker errors and return appropriate result
 */
function handlePickerError(error: unknown): ImagePickerResult {
  // User cancelled - not an error
  if (error instanceof Error && error.message.includes('User cancelled')) {
    logDebug('Image picker cancelled by user');
    return {
      success: false,
      error: 'User cancelled',
    };
  }

  // Permission denied
  if (error instanceof Error && error.message.includes('Permission')) {
    logError('Image picker permission error', error);
    return {
      success: false,
      error: 'Permission denied',
    };
  }

  // Other errors
  logError('Image picker error', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * Open camera for profile picture capture
 *
 * Opens the device camera with square cropping enabled (1:1 ratio).
 * The image will be cropped to 800x800 pixels and compressed.
 *
 * @returns ImagePickerResult with the captured image details
 *
 * @example
 * ```typescript
 * const result = await openCameraForProfilePicture();
 * if (result.success) {
 *   console.log('Image captured:', result.uri);
 * } else {
 *   console.log('Capture failed:', result.error);
 * }
 * ```
 */
export async function openCameraForProfilePicture(): Promise<ImagePickerResult> {
  // E2E mock: Return mock result without opening camera
  if (isE2EMockEnabled()) {
    return getE2EMockResult();
  }

  try {
    const image = await ImagePicker.openCamera(DEFAULT_PROFILE_PICTURE_OPTIONS);
    return transformPickerResult(image);
  } catch (error) {
    return handlePickerError(error);
  }
}

/**
 * Open photo library for profile picture selection
 *
 * Opens the device photo library with square cropping enabled (1:1 ratio).
 * The image will be cropped to 800x800 pixels and compressed.
 *
 * Note: On iOS 14+, this works with LIMITED photo access.
 * Only user-selected photos will be visible.
 *
 * @returns ImagePickerResult with the selected image details
 *
 * @example
 * ```typescript
 * const result = await openLibraryForProfilePicture();
 * if (result.success) {
 *   console.log('Image selected:', result.uri);
 * } else {
 *   console.log('Selection failed:', result.error);
 * }
 * ```
 */
export async function openLibraryForProfilePicture(): Promise<ImagePickerResult> {
  // E2E mock: Return mock result without opening library
  if (isE2EMockEnabled()) {
    return getE2EMockResult();
  }

  try {
    const image = await ImagePicker.openPicker(DEFAULT_PROFILE_PICTURE_OPTIONS);
    return transformPickerResult(image);
  } catch (error) {
    return handlePickerError(error);
  }
}

/**
 * Clean up temporary files created by the image picker
 *
 * Call this after uploading to free up disk space.
 */
export async function cleanupPickerCache(): Promise<void> {
  try {
    await ImagePicker.clean();
  } catch (error) {
    logError('Failed to clean image picker cache', error);
  }
}
