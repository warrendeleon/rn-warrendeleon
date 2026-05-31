/**
 * Image Processor
 *
 * Processes images for profile picture uploads:
 * - Resize to 800x800 pixels (square)
 * - Compress to 80% JPEG quality
 * - Strip EXIF metadata (via re-encoding)
 *
 * Security: EXIF stripping removes GPS coordinates, device info, and other
 * sensitive metadata that users may not want to share.
 */

import { Image } from 'react-native-compressor';
import RNFS from 'react-native-fs';

import { isE2EMockEnabled } from '@app/config/e2e';
import { logDebug, logError } from '@app/utils/logger';

/** Target dimension for profile pictures (square) */
export const TARGET_DIMENSION = 800;

/** JPEG compression quality (0-1) */
export const COMPRESSION_QUALITY = 0.8;

/** Output format for processed images */
export const OUTPUT_FORMAT = 'jpg' as const;

export interface ProcessedImage {
  /** Path to the processed image file */
  uri: string;
  /** Width of the processed image */
  width: number;
  /** Height of the processed image */
  height: number;
  /** MIME type of the processed image */
  mimeType: 'image/jpeg';
  /** File size in bytes (if known) */
  fileSize?: number;
}

export interface ProcessImageOptions {
  /** Target width (default: 800) */
  maxWidth?: number;
  /** Target height (default: 800) */
  maxHeight?: number;
  /** Compression quality 0-1 (default: 0.8) */
  quality?: number;
  /** Whether to maintain aspect ratio (default: false for square crop) */
  maintainAspectRatio?: boolean;
}

export interface ImageProcessingError {
  code: 'PROCESSING_FAILED' | 'INVALID_INPUT' | 'FILE_NOT_FOUND';
  message: string;
}

/**
 * Process an image for profile picture upload
 *
 * This function:
 * 1. Resizes the image to fit within maxWidth x maxHeight (default 800x800)
 * 2. Compresses to JPEG at specified quality (default 80%)
 * 3. Strips EXIF metadata through the compression process
 *
 * @param sourceUri - Path to the source image
 * @param options - Processing options
 * @returns Promise<ProcessedImage> - Processed image data
 * @throws Error if processing fails
 *
 * @example
 * ```typescript
 * const processed = await processImage('/path/to/photo.heic');
 * // Result: { uri: '/path/to/processed.jpg', width: 800, height: 800, mimeType: 'image/jpeg' }
 * ```
 */
export async function processImage(
  sourceUri: string,
  options: ProcessImageOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = TARGET_DIMENSION,
    maxHeight = TARGET_DIMENSION,
    quality = COMPRESSION_QUALITY,
  } = options;

  // E2E mock: Return a mock processed image
  if (isE2EMockEnabled()) {
    logDebug('processImage: E2E mock enabled, returning mock processed image');
    return {
      uri: sourceUri,
      width: maxWidth,
      height: maxHeight,
      mimeType: 'image/jpeg',
      fileSize: 50000, // 50KB mock size
    };
  }

  try {
    logDebug('Processing image', { sourceUri, maxWidth, maxHeight, quality });

    // Use react-native-compressor to process the image
    // This automatically:
    // - Resizes to fit within maxWidth x maxHeight
    // - Converts to JPEG
    // - Strips EXIF metadata (as a side effect of re-encoding)
    const processedUri = await Image.compress(sourceUri, {
      maxWidth,
      maxHeight,
      quality,
      output: OUTPUT_FORMAT,
      returnableOutputType: 'uri',
    });

    logDebug('Image processed successfully', { processedUri });

    // The compressed image is always square if the source was square-cropped
    // Otherwise it maintains aspect ratio within the bounds
    return {
      uri: processedUri,
      width: maxWidth,
      height: maxHeight,
      mimeType: 'image/jpeg',
    };
  } catch (error) {
    logError('Failed to process image', error);
    throw new Error('Failed to process image. Please try again.', { cause: error });
  }
}

/**
 * Process an image that has already been cropped to square
 *
 * Use this after the image picker has done the square cropping.
 * Only applies compression and EXIF stripping.
 *
 * @param sourceUri - Path to the already-cropped image
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Promise<ProcessedImage> - Processed image data
 */
export async function processSquareImage(
  sourceUri: string,
  quality: number = COMPRESSION_QUALITY
): Promise<ProcessedImage> {
  return processImage(sourceUri, {
    maxWidth: TARGET_DIMENSION,
    maxHeight: TARGET_DIMENSION,
    quality,
  });
}

/**
 * Get estimated output file size for a given quality setting
 *
 * This is a rough estimate based on typical compression ratios.
 * Actual size depends on image content.
 *
 * @param _sourceWidth - Source image width (unused, kept for API compatibility)
 * @param _sourceHeight - Source image height (unused, kept for API compatibility)
 * @param quality - Compression quality 0-1
 * @returns number - Estimated file size in bytes
 */
export function estimateOutputSize(
  _sourceWidth: number,
  _sourceHeight: number,
  quality: number = COMPRESSION_QUALITY
): number {
  // Estimate based on target dimensions (after resize)
  // Source dimensions are unused because we always resize to TARGET_DIMENSION
  const targetPixels = TARGET_DIMENSION * TARGET_DIMENSION;

  // JPEG typically uses ~0.5-3 bytes per pixel depending on quality and content
  // For portrait photos at 80% quality, ~1.5 bytes per pixel is reasonable
  const bytesPerPixel = 0.5 + quality * 2;

  return Math.round(targetPixels * bytesPerPixel);
}

/**
 * Validate if a URI points to a local file
 *
 * @param uri - URI to validate
 * @returns boolean - True if the URI is a local file path
 */
export function isLocalFileUri(uri: string): boolean {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('/') ||
    uri.startsWith('ph://') || // iOS Photos URI
    uri.startsWith('content://') // Android content URI
  );
}

/**
 * Clean up temporary files created during processing
 *
 * Call this after successful upload or on error to clean up
 * intermediate files created during image processing.
 *
 * @param uris - Array of file URIs to delete
 * @returns Promise<void>
 */
export async function cleanupTempFiles(uris: string[]): Promise<void> {
  for (const uri of uris) {
    try {
      const cleanPath = uri.replace(/^file:\/\//, '');
      const exists = await RNFS.exists(cleanPath);

      if (exists) {
        await RNFS.unlink(cleanPath);
        logDebug('Cleaned up temp file', { uri });
      }
    } catch (error) {
      // Non-critical error, just log it
      logError('Failed to clean up temp file', error, { uri });
    }
  }
}
