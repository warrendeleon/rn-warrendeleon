/**
 * Tests for Face Detection Service
 *
 * Tests service functions with mocked faceDetector and nsfwDetector.
 * ML Kit and TFLite operations are mocked in unit tests.
 */

import {
  getDetailedFaceValidation,
  quickFaceCheck,
  validateProfilePicture,
} from '../faceDetectionService';

// Mock faceDetector
const mockDetectFaces = jest.fn();
const mockValidateFaceInImage = jest.fn();

jest.mock('@app/utils/image/faceDetector', () => ({
  detectFaces: (...args: unknown[]) => mockDetectFaces(...args),
  validateFaceInImage: (...args: unknown[]) => mockValidateFaceInImage(...args),
}));

// Mock nsfwDetector
const mockValidateImageContent = jest.fn();

jest.mock('@app/utils/image/nsfwDetector', () => ({
  validateImageContent: (...args: unknown[]) => mockValidateImageContent(...args),
}));

// Mock E2E config
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

// Mock logger
jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
}));

describe('faceDetectionService', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);

    // Default NSFW mock - content is appropriate
    mockValidateImageContent.mockResolvedValue({
      isAppropriate: true,
      message: 'Content is appropriate',
      classification: 'Neutral',
      confidence: 0.95,
    });
  });

  describe('validateProfilePicture', () => {
    it('should return valid for single face detected', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        confidence: 0.95,
        faces: [],
      });

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Face detected');
      expect(result.faceCount).toBe(1);
      expect(result.confidence).toBe(0.95);
    });

    it('should return invalid for no face detected', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        confidence: null,
        faces: [],
      });

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No face detected');
      expect(result.faceCount).toBe(0);
    });

    it('should return invalid for multiple faces', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 3,
        confidence: 0.9,
        faces: [],
      });

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Multiple faces');
      expect(result.faceCount).toBe(3);
    });

    it('should return invalid for detection errors', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        confidence: null,
        faces: [],
        error: 'ML Kit error',
      });

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Could not analyse');
    });

    it('should handle exceptions gracefully', async () => {
      mockDetectFaces.mockRejectedValue(new Error('Unexpected error'));

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Could not analyse');
      expect(result.faceCount).toBe(0);
    });

    it('should include detection result for debugging', async () => {
      const detectionResult = {
        hasFace: true,
        faceCount: 1,
        confidence: 0.95,
        faces: [],
      };
      mockDetectFaces.mockResolvedValue(detectionResult);

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.detectionResult).toEqual(detectionResult);
    });

    it('should return invalid for NSFW content', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        confidence: 0.95,
        faces: [],
      });
      mockValidateImageContent.mockResolvedValue({
        isAppropriate: false,
        message: 'This image appears to contain inappropriate content.',
        classification: 'Porn',
        confidence: 0.85,
      });

      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('inappropriate content');
      expect(result.failedValidation).toBe('content');
    });
  });

  describe('quickFaceCheck', () => {
    it('should return true when face is detected', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        confidence: 0.95,
        faces: [],
      });

      const result = await quickFaceCheck('/path/to/image.jpg');

      expect(result).toBe(true);
    });

    it('should return false when no face is detected', async () => {
      mockDetectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        confidence: null,
        faces: [],
      });

      const result = await quickFaceCheck('/path/to/image.jpg');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockDetectFaces.mockRejectedValue(new Error('Detection failed'));

      const result = await quickFaceCheck('/path/to/image.jpg');

      expect(result).toBe(false);
    });
  });

  describe('getDetailedFaceValidation', () => {
    it('should call validateFaceInImage with default options', async () => {
      mockValidateFaceInImage.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        faceCount: 1,
        confidence: 0.95,
      });

      await getDetailedFaceValidation('/path/to/image.jpg');

      expect(mockValidateFaceInImage).toHaveBeenCalledWith('/path/to/image.jpg', {
        requireSingleFace: true,
        minFaceConfidence: undefined,
      });
    });

    it('should pass custom options', async () => {
      mockValidateFaceInImage.mockResolvedValue({
        isValid: true,
        message: 'Face detected',
        faceCount: 2,
        confidence: 0.8,
      });

      await getDetailedFaceValidation('/path/to/image.jpg', {
        requireSingleFace: false,
        minConfidence: 0.5,
      });

      expect(mockValidateFaceInImage).toHaveBeenCalledWith('/path/to/image.jpg', {
        requireSingleFace: false,
        minFaceConfidence: 0.5,
      });
    });
  });

  describe('E2E mock behaviour', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('should return mock result for validateProfilePicture', async () => {
      const result = await validateProfilePicture('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Face detected');
      expect(result.faceCount).toBe(1);
      expect(result.confidence).toBe(0.95);
      expect(mockDetectFaces).not.toHaveBeenCalled();
    });

    it('should return true for quickFaceCheck', async () => {
      const result = await quickFaceCheck('/path/to/image.jpg');

      expect(result).toBe(true);
      expect(mockDetectFaces).not.toHaveBeenCalled();
    });

    it('should return mock result for getDetailedFaceValidation', async () => {
      const result = await getDetailedFaceValidation('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.confidence).toBe(0.95);
      expect(mockValidateFaceInImage).not.toHaveBeenCalled();
    });
  });
});
