/**
 * Face Detector
 *
 * Face detection for profile picture validation.
 * Uses Apple Vision on iOS (works on simulators). Android has no bundled
 * detector, so validation is skipped there rather than blocking the upload.
 *
 * Features:
 * - On-device processing (no network calls, privacy-preserving)
 * - iOS simulator support via Vision framework
 * - Single face detection for profile pictures
 * - Confidence scoring
 * - E2E mock support for testing
 */

import { NativeModules, Platform } from 'react-native';

import { isE2EMockEnabled } from '@app/config/e2e';
import { logDebug, logError, logWarning } from '@app/utils/logger';

// Native module for iOS Vision face detection
const { VisionFaceDetector } = NativeModules;

/** Minimum confidence score to consider a face valid (0-1) */
export const MIN_FACE_CONFIDENCE = 0.7;

/** Options for face detection */
export interface FaceDetectionOptions {
  /** Minimum probability to detect face (0-1, default: 0.7) */
  minFaceConfidence?: number;
  /** Whether to require exactly one face (default: true for profile pics) */
  requireSingleFace?: boolean;
}

/** Face bounds from detection */
export interface FaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Individual face data */
export interface DetectedFace {
  confidence: number;
  bounds: FaceBounds;
}

/** Result of face detection */
export interface FaceDetectionResult {
  /** Whether a valid face was detected */
  hasFace: boolean;
  /** Number of faces detected */
  faceCount: number;
  /** Confidence score of the first detected face (0-1) */
  confidence: number | null;
  /** Detailed face data */
  faces: DetectedFace[];
  /** Error message if detection failed */
  error?: string;
  /** True when the platform has no face detector, so no check was performed */
  unsupported?: boolean;
}

/** Face validation result for profile pictures */
export interface FaceValidationResult {
  /** Whether the image is valid for a profile picture */
  isValid: boolean;
  /** Human-readable message */
  message: string;
  /** Number of faces detected */
  faceCount: number;
  /** Confidence of face detection (0-1) */
  confidence: number | null;
}

/**
 * Detect faces using iOS Vision framework
 *
 * Uses VNDetectFaceLandmarksRequest for better detection of tilted faces,
 * with CIDetector multi-orientation fallback for rotated selfies.
 */
async function detectFacesIOS(imageUri: string): Promise<FaceDetectionResult> {
  if (!VisionFaceDetector) {
    logError('VisionFaceDetector native module not available');
    return {
      hasFace: false,
      faceCount: 0,
      confidence: null,
      faces: [],
      error: 'Face detection not available on this device',
    };
  }

  try {
    const result = await VisionFaceDetector.detectFaces(imageUri);
    return {
      hasFace: result.hasFace,
      faceCount: result.faceCount,
      confidence: result.faces?.[0]?.confidence ?? null,
      faces: result.faces ?? [],
    };
  } catch (error) {
    logError('iOS Vision face detection failed', error);
    throw error;
  }
}

/**
 * Android has no bundled face detector.
 *
 * This path previously imported `@infinitered/react-native-mlkit-face-detection`,
 * which declares `expo` and `expo-image` as peer dependencies. This app is bare
 * React Native with no Expo module system installed, so the import could never
 * resolve and it broke every release bundle.
 *
 * Reporting the platform as unsupported lets the validator skip the check.
 * Blocking every Android user from setting a profile picture would be a worse
 * outcome than not validating the photo.
 */
function detectFacesUnsupported(): FaceDetectionResult {
  logWarning('Face detection is unavailable on this platform, skipping the check');
  return {
    hasFace: false,
    faceCount: 0,
    confidence: null,
    faces: [],
    unsupported: true,
  };
}

/**
 * Detect faces in an image
 *
 * Uses Apple Vision on iOS and ML Kit on Android.
 * Processing happens entirely on the device - no network calls.
 *
 * @param imageUri - Path to the image file
 * @param options - Detection options
 * @returns Promise<FaceDetectionResult> - Detection result
 *
 * @example
 * ```typescript
 * const result = await detectFaces('/path/to/image.jpg');
 * if (result.hasFace) {
 *   console.log(`Found ${result.faceCount} face(s)`);
 * }
 * ```
 */
export async function detectFaces(
  imageUri: string,
  options: FaceDetectionOptions = {}
): Promise<FaceDetectionResult> {
  const { minFaceConfidence = MIN_FACE_CONFIDENCE } = options;

  // E2E mock: Return a successful detection
  if (isE2EMockEnabled()) {
    return {
      hasFace: true,
      faceCount: 1,
      confidence: 0.95,
      faces: [{ confidence: 0.95, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
    };
  }

  try {
    let result: FaceDetectionResult;

    if (Platform.OS === 'ios') {
      result = await detectFacesIOS(imageUri);
    } else {
      result = detectFacesUnsupported();
    }

    // Apply minimum confidence filter
    if (result.hasFace && result.confidence !== null && result.confidence < minFaceConfidence) {
      return {
        ...result,
        hasFace: false,
      };
    }

    return result;
  } catch (error) {
    logError('Face detection failed', error);
    return {
      hasFace: false,
      faceCount: 0,
      confidence: null,
      faces: [],
      error: 'Face detection failed. Please try again.',
    };
  }
}

/**
 * Validate an image for use as a profile picture
 *
 * Checks:
 * 1. At least one face is detected
 * 2. Optionally, exactly one face (for profile pictures)
 * 3. Face meets minimum confidence threshold
 *
 * @param imageUri - Path to the image file
 * @param options - Validation options
 * @returns Promise<FaceValidationResult> - Validation result with message
 *
 * @example
 * ```typescript
 * const validation = await validateFaceInImage('/path/to/photo.jpg');
 * if (validation.isValid) {
 *   // Proceed with upload
 * } else {
 *   // Show error to user
 *   showAlert(validation.message);
 * }
 * ```
 */
export async function validateFaceInImage(
  imageUri: string,
  options: FaceDetectionOptions = {}
): Promise<FaceValidationResult> {
  const { requireSingleFace = true, minFaceConfidence = MIN_FACE_CONFIDENCE } = options;

  // E2E mock: Return valid result
  if (isE2EMockEnabled()) {
    logDebug('validateFaceInImage: E2E mock enabled, returning valid');
    return {
      isValid: true,
      message: 'Face detected',
      faceCount: 1,
      confidence: 0.95,
    };
  }

  const result = await detectFaces(imageUri, { minFaceConfidence });

  // No detector on this platform: skip the check instead of rejecting the photo.
  if (result.unsupported) {
    return {
      isValid: true,
      message: 'Face validation is unavailable on this platform',
      faceCount: 0,
      confidence: null,
    };
  }

  // Check for detection errors
  if (result.error) {
    return {
      isValid: false,
      message: result.error,
      faceCount: 0,
      confidence: null,
    };
  }

  // No face detected
  if (!result.hasFace || result.faceCount === 0) {
    return {
      isValid: false,
      message: 'No face detected. Please select a photo that clearly shows your face.',
      faceCount: 0,
      confidence: null,
    };
  }

  // Multiple faces detected (when single face required)
  if (requireSingleFace && result.faceCount > 1) {
    logWarning('Multiple faces detected in profile picture', { faceCount: result.faceCount });
    return {
      isValid: false,
      message: `Multiple faces detected (${result.faceCount}). Please select a photo with only your face.`,
      faceCount: result.faceCount,
      confidence: result.confidence,
    };
  }

  // Low confidence detection
  if (result.confidence !== null && result.confidence < minFaceConfidence) {
    return {
      isValid: false,
      message: 'Face not clearly visible. Please select a clearer photo.',
      faceCount: result.faceCount,
      confidence: result.confidence,
    };
  }

  // Valid profile picture
  return {
    isValid: true,
    message: 'Face detected',
    faceCount: result.faceCount,
    confidence: result.confidence,
  };
}

/**
 * Quick check if image contains any face
 *
 * A simpler version of validateFaceInImage that just returns a boolean.
 * Use this when you only need a yes/no answer.
 *
 * @param imageUri - Path to the image file
 * @returns Promise<boolean> - True if at least one face is detected
 */
export async function hasFace(imageUri: string): Promise<boolean> {
  const result = await detectFaces(imageUri);
  return result.hasFace;
}
