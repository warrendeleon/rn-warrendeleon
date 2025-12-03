/**
 * Media Services
 *
 * Services for camera, photo library, and face detection.
 *
 * Note: NSFW detection (nsfwDetector.ts) exists but requires TensorFlow.js
 * React Native setup. Currently disabled - using face detection only.
 */

export {
  type FaceDetectionResult,
  type FaceValidationResult,
  getDetailedFaceValidation,
  type ProfilePictureValidationResult,
  quickFaceCheck,
  validateProfilePicture,
  type ValidationErrorCode,
} from './faceDetectionService';
export {
  cleanupPickerCache,
  type ImagePickerResult,
  openCameraForProfilePicture,
  openLibraryForProfilePicture,
} from './imagePickerService';
