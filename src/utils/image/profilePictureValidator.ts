/**
 * Profile Picture Validator
 *
 * Combined validation for profile pictures.
 * Checks both face detection AND content moderation.
 *
 * Requirements:
 * 1. Image must contain exactly one face
 * 2. Image must not contain NSFW/inappropriate content
 */

import { isE2EMockEnabled } from '@app/config/e2e';
import { logDebug, logError } from '@app/utils/logger';

import { type FaceValidationResult, validateFaceInImage } from './faceDetector';
import { type ContentValidationResult, validateImageContent } from './nsfwDetector';

/** Result of complete profile picture validation */
export interface ProfilePictureValidationResult {
  /** Whether the image is valid for use as a profile picture */
  isValid: boolean;
  /** Human-readable message for the user */
  message: string;
  /** Face validation details */
  faceValidation: FaceValidationResult | null;
  /** Content validation details */
  contentValidation: ContentValidationResult | null;
  /** Specific validation that failed (for debugging) */
  failedValidation?: 'face' | 'content';
}

/**
 * Validate an image for use as a profile picture
 *
 * Performs two checks:
 * 1. Face detection - ensures image contains exactly one face
 * 2. Content moderation - ensures image doesn't contain NSFW content
 *
 * Both checks must pass for the image to be valid.
 *
 * @param imageUri - Path to the image file
 * @returns Promise<ProfilePictureValidationResult> - Complete validation result
 *
 * @example
 * ```typescript
 * const validation = await validateProfilePicture('/path/to/photo.jpg');
 * if (validation.isValid) {
 *   // Proceed with upload
 * } else {
 *   showAlert(validation.message);
 * }
 * ```
 */
export async function validateProfilePicture(
  imageUri: string
): Promise<ProfilePictureValidationResult> {
  // E2E mock: Return valid result
  if (isE2EMockEnabled()) {
    logDebug('validateProfilePicture: E2E mock enabled, returning valid');
    return {
      isValid: true,
      message: 'Photo validated successfully',
      faceValidation: {
        isValid: true,
        message: 'Face detected',
        faceCount: 1,
        confidence: 0.95,
      },
      contentValidation: {
        isAppropriate: true,
        message: 'Content is appropriate',
        classification: 'Neutral',
        confidence: 0.95,
      },
    };
  }

  try {
    logDebug('Starting profile picture validation', { imageUri });

    // Run both validations in parallel for speed
    const [faceResult, contentResult] = await Promise.all([
      validateFaceInImage(imageUri),
      validateImageContent(imageUri),
    ]);

    logDebug('Validation complete', {
      faceValid: faceResult.isValid,
      contentAppropriate: contentResult.isAppropriate,
    });

    // Check face validation first (more common failure)
    if (!faceResult.isValid) {
      return {
        isValid: false,
        message: faceResult.message,
        faceValidation: faceResult,
        contentValidation: contentResult,
        failedValidation: 'face',
      };
    }

    // Check content validation
    if (!contentResult.isAppropriate) {
      return {
        isValid: false,
        message: contentResult.message,
        faceValidation: faceResult,
        contentValidation: contentResult,
        failedValidation: 'content',
      };
    }

    // Both validations passed
    return {
      isValid: true,
      message: 'Photo validated successfully',
      faceValidation: faceResult,
      contentValidation: contentResult,
    };
  } catch (error) {
    logError('Profile picture validation failed', error);
    return {
      isValid: false,
      message: 'Unable to validate photo. Please try again.',
      faceValidation: null,
      contentValidation: null,
    };
  }
}
