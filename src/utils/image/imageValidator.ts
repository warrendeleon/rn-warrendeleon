/**
 * Image Validator
 *
 * Validates images for profile picture uploads with:
 * - Magic bytes MIME type verification (prevents file type spoofing)
 * - File size limits (5MB max)
 * - Dimensions validation
 *
 * Security: Validates at client-side before upload to prevent malicious uploads.
 */

import RNFS from 'react-native-fs';

import { logError, logWarning } from '@app/utils/logger';

/** Maximum file size in bytes (5MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Minimum image dimension in pixels */
export const MIN_IMAGE_DIMENSION = 100;

/** Maximum image dimension in pixels */
export const MAX_IMAGE_DIMENSION = 4096;

/** Supported MIME types for profile pictures */
export type SupportedMimeType = 'image/jpeg' | 'image/png' | 'image/heic' | 'image/heif';

/** Magic bytes signatures for image formats */
const MAGIC_BYTES: Record<SupportedMimeType, number[][]> = {
  // JPEG: FFD8FF
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  // PNG: 89504E47
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  // HEIC/HEIF: Various signatures (ftyp box with specific brands)
  'image/heic': [
    // ftypheic
    [0x00, 0x00, 0x00, undefined, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
    // ftypmif1
    [0x00, 0x00, 0x00, undefined, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x69, 0x66, 0x31],
  ] as unknown as number[][],
  'image/heif': [
    // ftypheif (alias for HEIC format)
    [0x00, 0x00, 0x00, undefined, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x66],
  ] as unknown as number[][],
};

export interface ImageValidationResult {
  isValid: boolean;
  mimeType: SupportedMimeType | null;
  fileSize: number;
  errors: string[];
}

export interface ImageDimensionValidationResult {
  isValid: boolean;
  width: number;
  height: number;
  errors: string[];
}

/**
 * Read the first N bytes of a file for magic byte detection
 *
 * @param filePath - Path to the file (file:// URI or absolute path)
 * @param numBytes - Number of bytes to read
 * @returns Promise<number[]> - Array of byte values
 */
async function readMagicBytes(filePath: string, numBytes: number): Promise<number[]> {
  try {
    // Remove file:// prefix if present
    const cleanPath = filePath.replace(/^file:\/\//, '');

    // Read file as base64 and convert to bytes
    const base64Content = await RNFS.read(cleanPath, numBytes, 0, 'base64');
    const binaryString = atob(base64Content);

    const bytes: number[] = [];
    for (let i = 0; i < binaryString.length; i++) {
      bytes.push(binaryString.charCodeAt(i));
    }

    return bytes;
  } catch (error) {
    logError('Failed to read magic bytes', error);
    throw new Error('Failed to read file for validation');
  }
}

/**
 * Detect MIME type from magic bytes
 *
 * @param bytes - First N bytes of the file
 * @returns SupportedMimeType | null - Detected MIME type or null if not supported
 */
function detectMimeType(bytes: number[]): SupportedMimeType | null {
  for (const [mimeType, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const signature of signatures) {
      let matches = true;

      for (let i = 0; i < signature.length; i++) {
        // Skip undefined bytes in signature (wildcards)
        if (signature[i] === undefined) {
          continue;
        }
        if (bytes[i] !== signature[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        return mimeType as SupportedMimeType;
      }
    }
  }

  return null;
}

/**
 * Get file size in bytes
 *
 * @param filePath - Path to the file
 * @returns Promise<number> - File size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const cleanPath = filePath.replace(/^file:\/\//, '');
    const stat = await RNFS.stat(cleanPath);
    return stat.size;
  } catch (error) {
    logError('Failed to get file size', error);
    throw new Error('Failed to read file size');
  }
}

/**
 * Validate an image file for profile picture upload
 *
 * Performs:
 * 1. File size check (max 5MB)
 * 2. Magic bytes MIME type detection (prevents spoofing)
 *
 * @param filePath - Path to the image file
 * @returns Promise<ImageValidationResult> - Validation result with errors if any
 *
 * @example
 * ```typescript
 * const result = await validateImage('/path/to/image.jpg');
 * if (result.isValid) {
 *   // Proceed with upload
 * } else {
 *   // Show errors to user
 *   console.log(result.errors);
 * }
 * ```
 */
export async function validateImage(filePath: string): Promise<ImageValidationResult> {
  const errors: string[] = [];

  try {
    // 1. Check file size
    const fileSize = await getFileSize(filePath);

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      const maxSizeMB = MAX_FILE_SIZE_BYTES / (1024 * 1024);
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      errors.push(`File size (${fileSizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`);
    }

    if (fileSize === 0) {
      errors.push('File is empty');
      return { isValid: false, mimeType: null, fileSize, errors };
    }

    // 2. Check magic bytes for MIME type
    // Read enough bytes to check all signatures (12 bytes covers HEIC)
    const magicBytes = await readMagicBytes(filePath, 12);
    const mimeType = detectMimeType(magicBytes);

    if (!mimeType) {
      errors.push('Unsupported image format. Please use JPEG, PNG, or HEIC');
    }

    return {
      isValid: errors.length === 0,
      mimeType,
      fileSize,
      errors,
    };
  } catch (error) {
    logError('Image validation failed', error);
    return {
      isValid: false,
      mimeType: null,
      fileSize: 0,
      errors: ['Failed to validate image. Please try again.'],
    };
  }
}

/**
 * Validate image dimensions
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns ImageDimensionValidationResult - Validation result
 */
export function validateImageDimensions(
  width: number,
  height: number
): ImageDimensionValidationResult {
  const errors: string[] = [];

  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    errors.push(`Image must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION} pixels`);
  }

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    errors.push(
      `Image must be no larger than ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} pixels`
    );
  }

  return {
    isValid: errors.length === 0,
    width,
    height,
    errors,
  };
}

/**
 * Validate MIME type against allowed types
 *
 * @param mimeType - MIME type to check
 * @returns boolean - True if MIME type is supported
 */
export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return ['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(mimeType);
}

/**
 * Get human-readable file size
 *
 * @param bytes - File size in bytes
 * @returns string - Human-readable size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Quick check if file exists
 *
 * @param filePath - Path to the file
 * @returns Promise<boolean> - True if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const cleanPath = filePath.replace(/^file:\/\//, '');
    return await RNFS.exists(cleanPath);
  } catch (error) {
    logWarning('Failed to check file existence', { error });
    return false;
  }
}
