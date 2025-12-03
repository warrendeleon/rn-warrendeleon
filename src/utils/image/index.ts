/**
 * Image Utilities
 *
 * Exports for profile picture image processing, validation, and face detection.
 */

// Image Validator
export {
  fileExists,
  formatFileSize,
  type ImageDimensionValidationResult,
  type ImageValidationResult,
  isSupportedMimeType,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
  type SupportedMimeType,
  validateImage,
  validateImageDimensions,
} from './imageValidator';

// Image Processor
export {
  cleanupTempFiles,
  COMPRESSION_QUALITY,
  estimateOutputSize,
  isLocalFileUri,
  type ProcessedImage,
  processImage,
  type ProcessImageOptions,
  processSquareImage,
  TARGET_DIMENSION,
} from './imageProcessor';

// Face Detector
export {
  type DetectedFace,
  detectFaces,
  type FaceBounds,
  type FaceDetectionOptions,
  type FaceDetectionResult,
  type FaceValidationResult,
  hasFace,
  MIN_FACE_CONFIDENCE,
  validateFaceInImage,
} from './faceDetector';

// NSFW Detector
export {
  type ContentValidationResult,
  detectNSFW,
  isContentSafe,
  type NSFWCategory,
  type NSFWDetectionResult,
  type NSFWPrediction,
  preloadNSFWModel,
  validateImageContent,
} from './nsfwDetector';

// Combined Profile Picture Validator
export {
  type ProfilePictureValidationResult,
  validateProfilePicture,
} from './profilePictureValidator';
