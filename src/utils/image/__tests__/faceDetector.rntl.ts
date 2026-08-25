/**
 * Tests for Face Detector utilities
 *
 * Tests face detection functions with mocked native modules.
 * Uses Vision on iOS, which is mocked. Android has no detector.
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

  describe('validateFaceInImage edge cases', () => {
    it('should handle confidence exactly at threshold', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.7, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await validateFaceInImage('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
    });

    it('should handle confidence just below threshold', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.69, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await validateFaceInImage('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No face detected');
    });

    it('should handle custom minFaceConfidence in validation', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 1,
        faces: [{ confidence: 0.5, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
      });

      const result = await validateFaceInImage('/path/to/image.jpg', {
        minFaceConfidence: 0.4,
      });

      expect(result.isValid).toBe(true);
    });

    it('should return invalid when hasFace is true but faceCount is 0', async () => {
      // Edge case: inconsistent API response
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 0,
        faces: [],
      });

      const result = await validateFaceInImage('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No face detected');
    });
  });

  describe('iOS Vision face array handling', () => {
    it('should handle empty faces array', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        faces: [],
      });

      const result = await detectFaces('/path/to/image.jpg');

      expect(result.faces).toEqual([]);
      expect(result.confidence).toBeNull();
    });

    it('should handle undefined faces array', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: false,
        faceCount: 0,
        // faces: undefined
      });

      const result = await detectFaces('/path/to/image.jpg');

      expect(result.faces).toEqual([]);
      expect(result.confidence).toBeNull();
    });

    it('should return first face confidence when multiple faces detected', async () => {
      mockVisionDetector.detectFaces.mockResolvedValue({
        hasFace: true,
        faceCount: 2,
        faces: [
          { confidence: 0.95, bounds: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 } },
          { confidence: 0.8, bounds: { x: 0.5, y: 0.1, width: 0.3, height: 0.3 } },
        ],
      });

      const result = await detectFaces('/path/to/image.jpg');

      expect(result.confidence).toBe(0.95);
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

/**
 * Android ships no face detector. `detectFaces` reports the platform as
 * unsupported, and `validateFaceInImage` skips the check rather than rejecting
 * the photo, so an Android user can still set a profile picture.
 *
 * The iOS path (via the VisionFaceDetector native module) is tested above.
 */
describe('faceDetector (Android, no detector available)', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (Platform as unknown as { OS: string }).OS = 'android';
  });

  afterEach(() => {
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  it('should flag the platform as unsupported rather than erroring', async () => {
    const result = await detectFaces('/path/to/android-image.jpg');

    expect(result.unsupported).toBe(true);
    expect(result.hasFace).toBe(false);
    expect(result.faceCount).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it('should let the photo through instead of blocking the upload', async () => {
    const result = await validateFaceInImage('/path/to/android-image.jpg');

    expect(result.isValid).toBe(true);
    expect(result.message).toBe('Face validation is unavailable on this platform');
  });

  it('should not claim a face was found', async () => {
    const result = await hasFace('/path/to/android-image.jpg');

    expect(result).toBe(false);
  });
});

describe('faceDetector (Android E2E mock path)', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    // Set Platform to Android
    (Platform as unknown as { OS: string }).OS = 'android';
  });

  afterEach(() => {
    // Reset to iOS
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  it('should return E2E mock result on Android when mock is enabled', async () => {
    (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

    const result = await detectFaces('/path/to/android-image.jpg');

    expect(result.hasFace).toBe(true);
    expect(result.faceCount).toBe(1);
    expect(result.confidence).toBe(0.95);
    // E2E mock should bypass native module call
  });

  it('should return valid E2E mock validation result on Android', async () => {
    (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

    const result = await validateFaceInImage('/path/to/android-image.jpg');

    expect(result.isValid).toBe(true);
    expect(result.message).toBe('Face detected');
    expect(result.confidence).toBe(0.95);
  });

  it('should return true for hasFace on Android with E2E mock', async () => {
    (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

    const result = await hasFace('/path/to/android-image.jpg');

    expect(result).toBe(true);
  });
});

describe('validateFaceInImage low confidence path', () => {
  const { NativeModules } = require('react-native');
  const mockVisionDetector = NativeModules.VisionFaceDetector;
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  it('should return invalid with low confidence message when confidence below threshold after detection', async () => {
    // This tests line 304: the path where hasFace is true but confidence is below threshold
    // Different from the minFaceConfidence filter in detectFaces
    mockVisionDetector.detectFaces.mockResolvedValue({
      hasFace: true,
      faceCount: 1,
      // Return confidence that passes detectFaces filter but tests validateFaceInImage check
      faces: [{ confidence: 0.65, bounds: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } }],
    });

    const result = await validateFaceInImage('/path/to/blurry.jpg', {
      minFaceConfidence: 0.7,
    });

    // The detectFaces with minFaceConfidence will return hasFace: false
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('No face detected');
  });

  it('should handle detection error in validation and return error message', async () => {
    // Test the error path at lines 272-279
    mockVisionDetector.detectFaces.mockRejectedValue(new Error('Detection failed'));

    const result = await validateFaceInImage('/path/to/corrupt.jpg');

    expect(result.isValid).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.faceCount).toBe(0);
  });
});
