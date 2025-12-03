/**
 * Tests for Image Validator utilities
 *
 * Tests MIME type detection, file size validation, and dimension validation.
 * Native file system operations are mocked.
 */

import {
  fileExists,
  formatFileSize,
  isSupportedMimeType,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
  validateImageDimensions,
} from '../imageValidator';

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  stat: jest.fn(),
  read: jest.fn(),
  exists: jest.fn(),
}));

describe('imageValidator', () => {
  describe('isSupportedMimeType', () => {
    it('should return true for JPEG', () => {
      expect(isSupportedMimeType('image/jpeg')).toBe(true);
    });

    it('should return true for PNG', () => {
      expect(isSupportedMimeType('image/png')).toBe(true);
    });

    it('should return true for HEIC', () => {
      expect(isSupportedMimeType('image/heic')).toBe(true);
    });

    it('should return true for HEIF', () => {
      expect(isSupportedMimeType('image/heif')).toBe(true);
    });

    it('should return false for GIF', () => {
      expect(isSupportedMimeType('image/gif')).toBe(false);
    });

    it('should return false for WebP', () => {
      expect(isSupportedMimeType('image/webp')).toBe(false);
    });

    it('should return false for BMP', () => {
      expect(isSupportedMimeType('image/bmp')).toBe(false);
    });

    it('should return false for non-image MIME types', () => {
      expect(isSupportedMimeType('application/pdf')).toBe(false);
      expect(isSupportedMimeType('text/plain')).toBe(false);
      expect(isSupportedMimeType('video/mp4')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isSupportedMimeType('')).toBe(false);
    });
  });

  describe('validateImageDimensions', () => {
    it('should pass for valid dimensions', () => {
      const result = validateImageDimensions(800, 800);

      expect(result.isValid).toBe(true);
      expect(result.width).toBe(800);
      expect(result.height).toBe(800);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for minimum valid dimensions', () => {
      const result = validateImageDimensions(MIN_IMAGE_DIMENSION, MIN_IMAGE_DIMENSION);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for maximum valid dimensions', () => {
      const result = validateImageDimensions(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for dimensions below minimum', () => {
      const result = validateImageDimensions(50, 50);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('at least');
    });

    it('should fail for width below minimum', () => {
      const result = validateImageDimensions(50, 800);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should fail for height below minimum', () => {
      const result = validateImageDimensions(800, 50);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should fail for dimensions above maximum', () => {
      const result = validateImageDimensions(5000, 5000);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('no larger than');
    });

    it('should fail for width above maximum', () => {
      const result = validateImageDimensions(5000, 800);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should fail for height above maximum', () => {
      const result = validateImageDimensions(800, 5000);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should report multiple errors for both dimension issues', () => {
      const result = validateImageDimensions(50, 5000);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    });

    it('should format zero correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle edge cases at boundaries', () => {
      expect(formatFileSize(1023)).toBe('1023 B');
      expect(formatFileSize(1024 * 1024 - 1)).toContain('KB');
    });
  });

  describe('fileExists', () => {
    const mockRNFS = require('react-native-fs');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true when file exists', async () => {
      mockRNFS.exists.mockResolvedValue(true);

      const result = await fileExists('/path/to/file.jpg');

      expect(result).toBe(true);
      expect(mockRNFS.exists).toHaveBeenCalledWith('/path/to/file.jpg');
    });

    it('should return false when file does not exist', async () => {
      mockRNFS.exists.mockResolvedValue(false);

      const result = await fileExists('/path/to/missing.jpg');

      expect(result).toBe(false);
    });

    it('should strip file:// prefix', async () => {
      mockRNFS.exists.mockResolvedValue(true);

      await fileExists('file:///path/to/file.jpg');

      expect(mockRNFS.exists).toHaveBeenCalledWith('/path/to/file.jpg');
    });

    it('should return false on error', async () => {
      mockRNFS.exists.mockRejectedValue(new Error('Permission denied'));

      const result = await fileExists('/path/to/file.jpg');

      expect(result).toBe(false);
    });
  });

  describe('constants', () => {
    it('should have correct MAX_FILE_SIZE_BYTES', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024); // 5MB
    });

    it('should have correct MIN_IMAGE_DIMENSION', () => {
      expect(MIN_IMAGE_DIMENSION).toBe(100);
    });

    it('should have correct MAX_IMAGE_DIMENSION', () => {
      expect(MAX_IMAGE_DIMENSION).toBe(4096);
    });
  });
});
