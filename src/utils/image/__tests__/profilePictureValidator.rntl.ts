/**
 * Tests for Profile Picture Validator
 *
 * Tests the combined validation that checks both face detection
 * and content moderation for profile pictures.
 */

import { validateProfilePicture } from '../profilePictureValidator';

// Mock E2E config
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

// Mock logger
jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

// Mock face detector
jest.mock('../faceDetector', () => ({
  validateFaceInImage: jest.fn(),
}));

// Mock NSFW detector
jest.mock('../nsfwDetector', () => ({
  validateImageContent: jest.fn(),
}));

describe('profilePictureValidator', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { validateFaceInImage } = require('../faceDetector');
  const { validateImageContent } = require('../nsfwDetector');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  describe('validateProfilePicture', () => {
    it('should return valid when both face and content validations pass', async () => {
      validateFaceInImage.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        faceCount: 1,
        confidence: 0.95,
      });

      validateImageContent.mockResolvedValue({
        isAppropriate: true,
        message: 'Content is appropriate',
        classification: 'Neutral',
        confidence: 0.95,
      });

      const result = await validateProfilePicture('/path/to/portrait.jpg');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Photo validated successfully');
      expect(result.faceValidation).not.toBeNull();
      expect(result.contentValidation).not.toBeNull();
      expect(result.failedValidation).toBeUndefined();
    });

    it('should return invalid when no face is detected', async () => {
      validateFaceInImage.mockResolvedValue({
        isValid: false,
        message: 'No face detected. Please select a photo that clearly shows your face.',
        faceCount: 0,
        confidence: null,
      });

      validateImageContent.mockResolvedValue({
        isAppropriate: true,
        message: 'Content is appropriate',
        classification: 'Neutral',
        confidence: 0.95,
      });

      const result = await validateProfilePicture('/path/to/landscape.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No face detected');
      expect(result.failedValidation).toBe('face');
    });

    it('should return invalid when multiple faces are detected', async () => {
      validateFaceInImage.mockResolvedValue({
        isValid: false,
        message: 'Multiple faces detected (3). Please select a photo with only your face.',
        faceCount: 3,
        confidence: 0.9,
      });

      validateImageContent.mockResolvedValue({
        isAppropriate: true,
        message: 'Content is appropriate',
        classification: 'Neutral',
        confidence: 0.95,
      });

      const result = await validateProfilePicture('/path/to/group.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Multiple faces detected');
      expect(result.failedValidation).toBe('face');
    });

    it('should return invalid when content is inappropriate', async () => {
      validateFaceInImage.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        faceCount: 1,
        confidence: 0.95,
      });

      validateImageContent.mockResolvedValue({
        isAppropriate: false,
        message:
          'This image appears to contain inappropriate content. Please select a different photo.',
        classification: 'Porn',
        confidence: 0.85,
      });

      const result = await validateProfilePicture('/path/to/nsfw.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('inappropriate content');
      expect(result.failedValidation).toBe('content');
    });

    it('should prioritise face validation failure over content failure', async () => {
      validateFaceInImage.mockResolvedValue({
        isValid: false,
        message: 'No face detected',
        faceCount: 0,
        confidence: null,
      });

      validateImageContent.mockResolvedValue({
        isAppropriate: false,
        message: 'Inappropriate content',
        classification: 'Porn',
        confidence: 0.85,
      });

      const result = await validateProfilePicture('/path/to/bad.jpg');

      expect(result.isValid).toBe(false);
      expect(result.failedValidation).toBe('face');
    });

    it('should run both validations in parallel', async () => {
      // Create promises that resolve after fake timers advance
      const facePromise = new Promise(resolve => {
        setTimeout(() => {
          resolve({
            isValid: true,
            message: 'Face detected',
            faceCount: 1,
            confidence: 0.95,
          });
        }, 50);
      });

      const contentPromise = new Promise(resolve => {
        setTimeout(() => {
          resolve({
            isAppropriate: true,
            message: 'Content is appropriate',
            classification: 'Neutral',
            confidence: 0.95,
          });
        }, 50);
      });

      validateFaceInImage.mockReturnValue(facePromise);
      validateImageContent.mockReturnValue(contentPromise);

      // Start the validation (don't await yet)
      const resultPromise = validateProfilePicture('/path/to/image.jpg');

      // Both validations should be called immediately (in parallel)
      expect(validateFaceInImage).toHaveBeenCalledTimes(1);
      expect(validateImageContent).toHaveBeenCalledTimes(1);

      // Advance timers to resolve both promises
      jest.advanceTimersByTime(50);

      // Now await the result
      const result = await resultPromise;
      expect(result.isValid).toBe(true);
    });

    it('should handle validation errors gracefully', async () => {
      validateFaceInImage.mockRejectedValue(new Error('Face detection failed'));
      validateImageContent.mockRejectedValue(new Error('Content validation failed'));

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Unable to validate photo. Please try again.');
      expect(result.faceValidation).toBeNull();
      expect(result.contentValidation).toBeNull();
    });

    it('should handle face validation error only', async () => {
      validateFaceInImage.mockRejectedValue(new Error('Face detection failed'));
      validateImageContent.mockResolvedValue({
        isAppropriate: true,
        message: 'Content is appropriate',
        classification: 'Neutral',
        confidence: 0.95,
      });

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Unable to validate photo. Please try again.');
    });

    it('should handle content validation error only', async () => {
      validateFaceInImage.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        faceCount: 1,
        confidence: 0.95,
      });
      validateImageContent.mockRejectedValue(new Error('Content validation failed'));

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Unable to validate photo. Please try again.');
    });
  });

  describe('E2E mock behaviour', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('should return valid mock result when E2E mock is enabled', async () => {
      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Photo validated successfully');
      expect(result.faceValidation?.isValid).toBe(true);
      expect(result.contentValidation?.isAppropriate).toBe(true);
      expect(validateFaceInImage).not.toHaveBeenCalled();
      expect(validateImageContent).not.toHaveBeenCalled();
    });
  });
});
