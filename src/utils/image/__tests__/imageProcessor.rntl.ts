/**
 * Tests for Image Processor utilities
 *
 * Tests image processing functions with mocked react-native-compressor.
 */

import {
  COMPRESSION_QUALITY,
  estimateOutputSize,
  isLocalFileUri,
  OUTPUT_FORMAT,
  TARGET_DIMENSION,
} from '../imageProcessor';

// Mock react-native-compressor
jest.mock('react-native-compressor', () => ({
  Image: {
    compress: jest.fn(),
  },
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  exists: jest.fn(),
  unlink: jest.fn(),
}));

// Mock E2E config
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

describe('imageProcessor', () => {
  describe('constants', () => {
    it('should have TARGET_DIMENSION of 800', () => {
      expect(TARGET_DIMENSION).toBe(800);
    });

    it('should have COMPRESSION_QUALITY of 0.8', () => {
      expect(COMPRESSION_QUALITY).toBe(0.8);
    });

    it('should have OUTPUT_FORMAT of jpg', () => {
      expect(OUTPUT_FORMAT).toBe('jpg');
    });
  });

  describe('isLocalFileUri', () => {
    it('should return true for file:// URIs', () => {
      expect(isLocalFileUri('file:///path/to/image.jpg')).toBe(true);
    });

    it('should return true for absolute paths', () => {
      expect(isLocalFileUri('/var/mobile/images/photo.jpg')).toBe(true);
    });

    it('should return true for iOS Photos URIs (ph://)', () => {
      expect(isLocalFileUri('ph://A1B2C3D4-E5F6-7890-ABCD-EF1234567890')).toBe(true);
    });

    it('should return true for Android content URIs', () => {
      expect(isLocalFileUri('content://media/external/images/media/123')).toBe(true);
    });

    it('should return false for HTTP URLs', () => {
      expect(isLocalFileUri('http://example.com/image.jpg')).toBe(false);
    });

    it('should return false for HTTPS URLs', () => {
      expect(isLocalFileUri('https://example.com/image.jpg')).toBe(false);
    });

    it('should return false for data URIs', () => {
      expect(isLocalFileUri('data:image/jpeg;base64,/9j/4AAQ...')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isLocalFileUri('')).toBe(false);
    });

    it('should return false for relative paths', () => {
      expect(isLocalFileUri('images/photo.jpg')).toBe(false);
      expect(isLocalFileUri('./images/photo.jpg')).toBe(false);
    });
  });

  describe('estimateOutputSize', () => {
    it('should estimate size based on quality', () => {
      const size = estimateOutputSize(1000, 1000, 0.8);

      // At quality 0.8: bytesPerPixel = 0.5 + 0.8 * 2 = 2.1
      // targetPixels = 800 * 800 = 640000
      // Expected size = 640000 * 2.1 = 1344000
      expect(size).toBe(1344000);
    });

    it('should estimate smaller size for lower quality', () => {
      const highQuality = estimateOutputSize(1000, 1000, 0.9);
      const lowQuality = estimateOutputSize(1000, 1000, 0.5);

      expect(lowQuality).toBeLessThan(highQuality);
    });

    it('should use default quality if not provided', () => {
      const sizeWithDefault = estimateOutputSize(1000, 1000);
      const sizeWithExplicit = estimateOutputSize(1000, 1000, COMPRESSION_QUALITY);

      expect(sizeWithDefault).toBe(sizeWithExplicit);
    });

    it('should base estimate on TARGET_DIMENSION regardless of source dimensions', () => {
      // Source dimensions are unused - estimate is based on TARGET_DIMENSION
      const smallSource = estimateOutputSize(100, 100, 0.8);
      const largeSource = estimateOutputSize(4000, 4000, 0.8);

      expect(smallSource).toBe(largeSource);
    });

    it('should return reasonable estimates', () => {
      const estimate = estimateOutputSize(1000, 1000, 0.8);

      // For an 800x800 image at 80% quality, estimate should be reasonable
      // Typically between 500KB and 2MB
      expect(estimate).toBeGreaterThan(500 * 1024);
      expect(estimate).toBeLessThan(2 * 1024 * 1024);
    });

    it('should handle minimum quality', () => {
      const size = estimateOutputSize(1000, 1000, 0);

      // At quality 0: bytesPerPixel = 0.5
      expect(size).toBe(640000 * 0.5);
    });

    it('should handle maximum quality', () => {
      const size = estimateOutputSize(1000, 1000, 1);

      // At quality 1: bytesPerPixel = 0.5 + 2 = 2.5
      expect(size).toBe(640000 * 2.5);
    });
  });

  describe('processImage with E2E mock', () => {
    // Import after mocking
    const { processImage } = require('../imageProcessor');
    const { isE2EMockEnabled } = require('@app/config/e2e');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return mock result when E2E mock is enabled', async () => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const result = await processImage('/path/to/image.jpg');

      expect(result).toEqual({
        uri: '/path/to/image.jpg',
        width: TARGET_DIMENSION,
        height: TARGET_DIMENSION,
        mimeType: 'image/jpeg',
        fileSize: 50000,
      });
    });

    it('should use custom dimensions in mock when provided', async () => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const result = await processImage('/path/to/image.jpg', {
        maxWidth: 400,
        maxHeight: 400,
      });

      expect(result.width).toBe(400);
      expect(result.height).toBe(400);
    });
  });

  describe('processSquareImage with E2E mock', () => {
    const { processSquareImage } = require('../imageProcessor');
    const { isE2EMockEnabled } = require('@app/config/e2e');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should use TARGET_DIMENSION for square processing', async () => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const result = await processSquareImage('/path/to/image.jpg');

      expect(result.width).toBe(TARGET_DIMENSION);
      expect(result.height).toBe(TARGET_DIMENSION);
    });
  });

  /**
   * Note: Integration tests for actual image compression are performed via E2E tests.
   * The react-native-compressor library requires native modules which are mocked
   * in unit tests.
   *
   * E2E tests verify:
   * - Image compression actually reduces file size
   * - EXIF metadata is stripped
   * - Output is valid JPEG
   * - Dimensions are correctly resized
   */
});
