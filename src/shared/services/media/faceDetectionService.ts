/**
 * Face Detection Service
 *
 * Orchestrates face detection and NSFW content validation for profile pictures.
 * Uses ML Kit for face detection and TFLite for NSFW detection.
 * Both run on-device for privacy.
 *
 * Features:
 * - Single face validation for profile pictures
 * - NSFW content detection
 * - Confidence threshold checking
 * - User-friendly error messages
 * - E2E mock support for testing
 */

import { isE2EMockEnabled } from '@app/config/e2e';
import {
  detectFaces,
  type FaceDetectionResult,
  type FaceValidationResult,
  validateFaceInImage,
} from '@app/utils/image/faceDetector';
import { validateImageContent } from '@app/utils/image/nsfwDetector';
import { logDebug, logError } from '@app/utils/logger';

/** Profile picture validation result */
export interface ProfilePictureValidationResult {
  /** Whether the image is valid for use as a profile picture */
  isValid: boolean;
  /** User-friendly message describing the validation result */
  message: string;
  /** Number of faces detected */
  faceCount: number;
  /** Confidence score of face detection (0-1) */
  confidence: number | null;
  /** Original detection result for debugging */
  detectionResult?: FaceDetectionResult;
  /** Specific validation that failed (for debugging) */
  failedValidation?: 'face' | 'content';
}

/** Validation error codes */
export type ValidationErrorCode =
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'LOW_CONFIDENCE'
  | 'DETECTION_FAILED'
  | 'NSFW_CONTENT';

/**
 * User-friendly messages for validation outcomes
 */
const VALIDATION_MESSAGES = {
  VALID: 'Face detected',
  NO_FACE: 'No face detected in this photo. Please choose a photo that clearly shows your face.',
  MULTIPLE_FACES: 'Multiple faces detected. Please choose a photo that shows only you.',
  LOW_CONFIDENCE: 'Face not clearly visible. Please choose a photo with better lighting.',
  DETECTION_FAILED: 'Could not analyse the photo. Please try again with a different image.',
  NSFW_CONTENT:
    'This image appears to contain inappropriate content. Please select a different photo.',
};

/**
 * E2E mock result for testing
 */
const E2E_MOCK_RESULT: ProfilePictureValidationResult = {
  isValid: true,
  message: VALIDATION_MESSAGES.VALID,
  faceCount: 1,
  confidence: 0.95,
};

/**
 * Validate an image for use as a profile picture
 *
 * Checks that the image contains exactly one clearly visible face.
 * This is the main function to use for profile picture validation.
 *
 * @param imagePath - Local file path to the image
 * @returns Validation result with user-friendly message
 *
 * @example
 * ```typescript
 * const result = await validateProfilePicture('/path/to/image.jpg');
 *
 * if (result.isValid) {
 *   // Proceed with upload
 *   await uploadProfilePicture(imagePath);
 * } else {
 *   // Show error to user
 *   showAlert(result.message);
 * }
 * ```
 */
export async function validateProfilePicture(
  imagePath: string
): Promise<ProfilePictureValidationResult> {
  // E2E mock: Return mock result
  if (isE2EMockEnabled()) {
    return E2E_MOCK_RESULT;
  }

  try {
    logDebug('Starting profile picture validation (face + NSFW)', { imagePath });

    // Run face detection and NSFW detection in parallel for speed
    const [detectionResult, contentResult] = await Promise.all([
      detectFaces(imagePath),
      validateImageContent(imagePath),
    ]);

    logDebug('Validation complete', {
      hasFace: detectionResult.hasFace,
      faceCount: detectionResult.faceCount,
      contentAppropriate: contentResult.isAppropriate,
    });

    // NSFW content check first - most important rejection reason
    if (!contentResult.isAppropriate) {
      return {
        isValid: false,
        message: contentResult.message || VALIDATION_MESSAGES.NSFW_CONTENT,
        faceCount: detectionResult.faceCount,
        confidence: detectionResult.confidence,
        detectionResult,
        failedValidation: 'content',
      };
    }

    // Handle detection errors
    if (detectionResult.error) {
      logError('Face detection failed', detectionResult.error);
      return {
        isValid: false,
        message: VALIDATION_MESSAGES.DETECTION_FAILED,
        faceCount: 0,
        confidence: null,
        detectionResult,
        failedValidation: 'face',
      };
    }

    // No face detected
    if (!detectionResult.hasFace || detectionResult.faceCount === 0) {
      return {
        isValid: false,
        message: VALIDATION_MESSAGES.NO_FACE,
        faceCount: detectionResult.faceCount,
        confidence: detectionResult.confidence,
        detectionResult,
        failedValidation: 'face',
      };
    }

    // Multiple faces detected
    if (detectionResult.faceCount > 1) {
      return {
        isValid: false,
        message: VALIDATION_MESSAGES.MULTIPLE_FACES,
        faceCount: detectionResult.faceCount,
        confidence: detectionResult.confidence,
        detectionResult,
        failedValidation: 'face',
      };
    }

    // Both face and content validations passed
    return {
      isValid: true,
      message: VALIDATION_MESSAGES.VALID,
      faceCount: 1,
      confidence: detectionResult.confidence,
      detectionResult,
    };
  } catch (error) {
    logError('Profile picture validation error', error);
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.DETECTION_FAILED,
      faceCount: 0,
      confidence: null,
    };
  }
}

/**
 * Quick check if an image contains a face
 *
 * Use this for a fast boolean check without detailed validation.
 * For full validation with user messages, use `validateProfilePicture`.
 *
 * @param imagePath - Local file path to the image
 * @returns true if at least one face is detected with sufficient confidence
 *
 * @example
 * ```typescript
 * const hasFace = await quickFaceCheck('/path/to/image.jpg');
 * if (!hasFace) {
 *   showWarning('This image may not contain a face');
 * }
 * ```
 */
export async function quickFaceCheck(imagePath: string): Promise<boolean> {
  // E2E mock: Return true
  if (isE2EMockEnabled()) {
    logDebug('faceDetectionService: E2E mock enabled, returning true for quick check');
    return true;
  }

  try {
    const result = await detectFaces(imagePath);
    return result.hasFace;
  } catch (error) {
    logError('Quick face check failed', error);
    return false;
  }
}

/**
 * Get detailed face validation result (wrapper around faceDetector)
 *
 * Provides more granular control for advanced use cases.
 *
 * @param imagePath - Local file path to the image
 * @param options - Validation options
 * @returns Detailed face validation result
 */
export async function getDetailedFaceValidation(
  imagePath: string,
  options: { requireSingleFace?: boolean; minConfidence?: number } = {}
): Promise<FaceValidationResult> {
  // E2E mock: Return valid result
  if (isE2EMockEnabled()) {
    logDebug('faceDetectionService: E2E mock enabled, returning mock detailed validation');
    return {
      isValid: true,
      message: VALIDATION_MESSAGES.VALID,
      faceCount: 1,
      confidence: 0.95,
    };
  }

  return validateFaceInImage(imagePath, {
    requireSingleFace: options.requireSingleFace ?? true,
    minFaceConfidence: options.minConfidence,
  });
}

// Re-export types from faceDetector for convenience
export type { FaceDetectionResult, FaceValidationResult } from '@app/utils/image/faceDetector';
