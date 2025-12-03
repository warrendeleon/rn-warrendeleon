/**
 * Tests for Face Detector utilities
 *
 * Tests face detection functions with mocked native modules.
 * Uses Vision on iOS and ML Kit on Android - both are mocked.
 */

import { Platform } from 'react-native';

import { detectFaces, hasFace, MIN_FACE_CONFIDENCE, validateFaceInImage } from '../faceDetector';

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
  NativeModules: {
    VisionFaceDetector: {
      detectFaces: jest.fn(),
    },
  },
}));

// Mock Infinitered MLKit for Android (dynamic import)
jest.mock('@infinitered/react-native-mlkit-face-detection', () => ({
  RNMLKitFaceDetector: {
    detectFaces: jest.fn(),
  },
  useFacesInPhoto: jest.fn(),
}));

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

describe('faceDetector', () => {
  const { NativeModules } = require('react-native');
  const mockVisionDetector = NativeModules.VisionFaceDetector;
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    // Reset Platform to iOS for most tests
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  describe('constants', () => {
    it('should have MIN_FACE_CONFIDENCE of 0.7', () => {
      expect(MIN_FACE_CONFIDENCE).toBe(0.7);
    });
  });

  describe('detectFaces (iOS)', () => {
    it('should return hasFace true when faces are detected', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.9, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await detectFaces('/path/to/image.jpg');

      expect(result.hasFace).toBe(true);
      expect(result.faceCount).toBe(1);
      expect(result.confidence).toBe(0.9);
    });

    it('should return hasFace false when no faces are detected', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        faces: [],
      });

      const result = await detectFaces('/path/to/image.jpg');

      expect(result.hasFace).toBe(false);
      expect(result.faceCount).toBe(0);
      expect(result.confidence).toBeNull();
    });

    it('should detect multiple faces', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 3,
        faces: [
          { confidence: 0.9, bounds: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 } },
          { confidence: 0.85, bounds: { x: 0.4, y: 0.1, width: 0.3, height: 0.3 } },
          { confidence: 0.8, bounds: { x: 0.7, y: 0.1, width: 0.3, height: 0.3 } },
        ],
      });

      const result = await detectFaces('/path/to/group.jpg');

      expect(result.faceCount).toBe(3);
      expect(result.confidence).toBe(0.9);
    });

    it('should return hasFace false for low confidence', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.3, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await detectFaces('/path/to/image.jpg');

      // Low confidence triggers the minFaceConfidence filter
      expect(result.hasFace).toBe(false);
      expect(result.faceCount).toBe(1);
    });

    it('should use custom minFaceConfidence', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.5, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await detectFaces('/path/to/image.jpg', { minFaceConfidence: 0.4 });

      expect(result.hasFace).toBe(true);
    });

    it('should handle detection errors gracefully', async () => {
      mockVisionDetector.detectFaces.mockRejectedValue(new Error('Vision error'));

      const result = await detectFaces('/path/to/image.jpg');

      expect(result.hasFace).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateFaceInImage', () => {
    it('should return valid for image with one face', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.9, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await validateFaceInImage('/path/to/portrait.jpg');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Face detected');
      expect(result.faceCount).toBe(1);
    });

    it('should return invalid for image with no faces', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        faces: [],
      });

      const result = await validateFaceInImage('/path/to/landscape.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No face detected');
      expect(result.faceCount).toBe(0);
    });

    it('should return invalid for image with multiple faces when single required', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 2,
        faces: [
          { confidence: 0.9, bounds: { x: 0.1, y: 0.2, width: 0.3, height: 0.6 } },
          { confidence: 0.85, bounds: { x: 0.5, y: 0.2, width: 0.3, height: 0.6 } },
        ],
      });

      const result = await validateFaceInImage('/path/to/group.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Multiple faces detected');
      expect(result.faceCount).toBe(2);
    });

    it('should allow multiple faces when requireSingleFace is false', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 2,
        faces: [
          { confidence: 0.9, bounds: { x: 0.1, y: 0.2, width: 0.3, height: 0.6 } },
          { confidence: 0.85, bounds: { x: 0.5, y: 0.2, width: 0.3, height: 0.6 } },
        ],
      });

      const result = await validateFaceInImage('/path/to/group.jpg', {
        requireSingleFace: false,
      });

      expect(result.isValid).toBe(true);
    });

    it('should return invalid for low confidence detection', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.3, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await validateFaceInImage('/path/to/blurry.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No face detected');
    });

    it('should handle detection errors', async () => {
      mockVisionDetector.detectFaces.mockRejectedValue(new Error('Failed'));

      const result = await validateFaceInImage('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('hasFace', () => {
    it('should return true when face is detected', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.9, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await hasFace('/path/to/portrait.jpg');

      expect(result).toBe(true);
    });

    it('should return false when no face is detected', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        faces: [],
      });

      const result = await hasFace('/path/to/landscape.jpg');

      expect(result).toBe(false);
    });
  });

  describe('E2E mock behaviour', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('should return mock detection result when E2E mock is enabled', async () => {
      const result = await detectFaces('/path/to/image.jpg');

      expect(result.hasFace).toBe(true);
      expect(result.faceCount).toBe(1);
      expect(result.confidence).toBe(0.95);
      expect(mockVisionDetector.detectFaces).not.toHaveBeenCalled();
    });

    it('should return valid validation result when E2E mock is enabled', async () => {
      const result = await validateFaceInImage('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Face detected');
      expect(mockVisionDetector.detectFaces).not.toHaveBeenCalled();
    });
  });

  describe('native module unavailable', () => {
    it('should handle missing VisionFaceDetector gracefully', async () => {
      // Temporarily remove the native module
      const originalModule = NativeModules.VisionFaceDetector;
      NativeModules.VisionFaceDetector = null;

      // Need to re-require to pick up the null module
      jest.resetModules();
      const { detectFaces: detectFacesReloaded } = require('../faceDetector');

      const result = await detectFacesReloaded('/path/to/image.jpg');

      expect(result.hasFace).toBe(false);
      expect(result.error).toBeDefined();

      // Restore
      NativeModules.VisionFaceDetector = originalModule;
    });
  });

  /**
   * Note: Integration tests for actual face detection are performed via E2E tests.
   * Native modules (Vision/MLKit) are mocked in unit tests.
   *
   * E2E tests verify:
   * - Face detection works on real images
   * - Detection accuracy is acceptable
   * - Performance is reasonable
   * - Edge cases (partial faces, side profiles) are handled
   */
});
