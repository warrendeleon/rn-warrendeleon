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
  validateImage,
  validateImageDimensions,
} from '../imageValidator';

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  stat: jest.fn(),
  read: jest.fn(),
  exists: jest.fn(),
}));

// Mock logger to suppress console output in tests
jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logWarning: jest.fn(),
  logError: jest.fn(),
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

  describe('validateImage', () => {
    const mockRNFS = require('react-native-fs');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should validate a valid JPEG image', async () => {
      // Mock file size (1MB)
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });

      // Mock JPEG magic bytes (FFD8FF)
      const jpegBytes = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(jpegBytes);

      const result = await validateImage('/path/to/image.jpg');

      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.fileSize).toBe(1024 * 1024);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid PNG image', async () => {
      // Mock file size (2MB)
      mockRNFS.stat.mockResolvedValue({ size: 2 * 1024 * 1024 });

      // Mock PNG magic bytes (89504E47)
      const pngBytes = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(pngBytes);

      const result = await validateImage('/path/to/image.png');

      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/png');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file exceeding max size', async () => {
      // Mock file size (6MB - exceeds 5MB limit)
      mockRNFS.stat.mockResolvedValue({ size: 6 * 1024 * 1024 });

      // Mock JPEG magic bytes
      const jpegBytes = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(jpegBytes);

      const result = await validateImage('/path/to/large-image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('exceeds maximum');
    });

    it('should reject empty file', async () => {
      // Mock empty file
      mockRNFS.stat.mockResolvedValue({ size: 0 });

      const result = await validateImage('/path/to/empty.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File is empty');
    });

    it('should reject unsupported file format', async () => {
      // Mock file size
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });

      // Mock GIF magic bytes (not supported)
      const gifBytes = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(gifBytes);

      const result = await validateImage('/path/to/image.gif');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unsupported image format');
    });

    it('should strip file:// prefix from path', async () => {
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });

      const jpegBytes = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(jpegBytes);

      await validateImage('file:///path/to/image.jpg');

      expect(mockRNFS.stat).toHaveBeenCalledWith('/path/to/image.jpg');
      expect(mockRNFS.read).toHaveBeenCalledWith('/path/to/image.jpg', 12, 0, 'base64');
    });

    it('should handle file read errors gracefully', async () => {
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });
      mockRNFS.read.mockRejectedValue(new Error('Permission denied'));

      const result = await validateImage('/path/to/image.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Failed to validate image');
    });

    it('should handle file stat errors gracefully', async () => {
      mockRNFS.stat.mockRejectedValue(new Error('File not found'));

      const result = await validateImage('/path/to/missing.jpg');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Failed to validate image');
    });

    it('should validate HEIC image format', async () => {
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });

      // Mock HEIC magic bytes (ftyp heic)
      // HEIC: 00 00 00 XX 66 74 79 70 68 65 69 63
      const heicBytes = Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(heicBytes);

      const result = await validateImage('/path/to/image.heic');

      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/heic');
    });

    it('should validate HEIC mif1 variant', async () => {
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });

      // Mock HEIC mif1 magic bytes
      const heicMif1Bytes = Buffer.from([
        0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x69, 0x66, 0x31,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(heicMif1Bytes);

      const result = await validateImage('/path/to/image.heic');

      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/heic');
    });

    it('should validate HEIF image format', async () => {
      mockRNFS.stat.mockResolvedValue({ size: 1024 * 1024 });

      // Mock HEIF magic bytes (ftyp heif)
      const heifBytes = Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x66,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(heifBytes);

      const result = await validateImage('/path/to/image.heif');

      expect(result.isValid).toBe(true);
      expect(result.mimeType).toBe('image/heif');
    });

    it('should report both size and format errors', async () => {
      // Oversized AND unsupported format
      mockRNFS.stat.mockResolvedValue({ size: 6 * 1024 * 1024 });

      const gifBytes = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ]).toString('base64');
      mockRNFS.read.mockResolvedValue(gifBytes);

      const result = await validateImage('/path/to/large.gif');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
      expect(result.errors.some(e => e.includes('Unsupported'))).toBe(true);
    });
  });
});
