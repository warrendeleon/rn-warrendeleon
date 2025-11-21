# TASK-279: Image Processing

**ID**: TASK-279 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-049](../stories/US-049-image-file-attachments.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create image processing utilities to resize, compress, and optimise images before upload. Generate thumbnails, maintain aspect ratios, and ensure images meet size requirements for efficient storage and transmission.

---

## Acceptance Criteria

- [ ] Image processing service created in `src/services/chat/imageProcessingService.ts`
- [ ] Resize images to maximum dimensions
- [ ] Compress images to target file size
- [ ] Generate thumbnails
- [ ] Maintain aspect ratios
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Image Processing Service

```typescript
// src/services/chat/imageProcessingService.ts

import ImageResizer from 'react-native-image-resizer';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-100
  compressFormat?: 'JPEG' | 'PNG' | 'WEBP';
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  name: string;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_QUALITY = 80;
const DEFAULT_THUMBNAIL_SIZE = 200;

/**
 * Calculate dimensions to maintain aspect ratio
 */
export const calculateAspectRatioDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions => {
  const aspectRatio = originalWidth / originalHeight;

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  // Check if resizing is needed
  if (originalWidth > maxWidth || originalHeight > maxHeight) {
    if (aspectRatio > 1) {
      // Landscape
      targetWidth = Math.min(originalWidth, maxWidth);
      targetHeight = Math.round(targetWidth / aspectRatio);

      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
    } else {
      // Portrait or square
      targetHeight = Math.min(originalHeight, maxHeight);
      targetWidth = Math.round(targetHeight * aspectRatio);

      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(targetWidth / aspectRatio);
      }
    }
  }

  return {
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  };
};

/**
 * Process and resize image
 */
export const processImage = async (
  imageUri: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> => {
  try {
    const {
      maxWidth = DEFAULT_MAX_WIDTH,
      maxHeight = DEFAULT_MAX_HEIGHT,
      quality = DEFAULT_QUALITY,
      compressFormat = 'JPEG',
    } = options;

    // Resize image
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      maxWidth,
      maxHeight,
      compressFormat,
      quality,
      0, // rotation
      undefined, // outputPath
      false, // keepMeta
      {
        mode: 'contain', // Maintain aspect ratio
        onlyScaleDown: true, // Don't scale up
      }
    );

    return {
      uri: resizedImage.uri,
      width: resizedImage.width,
      height: resizedImage.height,
      size: resizedImage.size || 0,
      name: resizedImage.name || 'image.jpg',
    };
  } catch (error) {
    console.error('Failed to process image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Generate thumbnail from image
 */
export const generateThumbnail = async (
  imageUri: string,
  options: ThumbnailOptions = {
    width: DEFAULT_THUMBNAIL_SIZE,
    height: DEFAULT_THUMBNAIL_SIZE,
    quality: 70,
  }
): Promise<ProcessedImage> => {
  try {
    const { width, height, quality = 70 } = options;

    const thumbnail = await ImageResizer.createResizedImage(
      imageUri,
      width,
      height,
      'JPEG',
      quality,
      0,
      undefined,
      false,
      { mode: 'cover' } // Crop to fill
    );

    return {
      uri: thumbnail.uri,
      width: thumbnail.width,
      height: thumbnail.height,
      size: thumbnail.size || 0,
      name: thumbnail.name || 'thumbnail.jpg',
    };
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

/**
 * Compress image to target file size
 */
export const compressImageToTargetSize = async (
  imageUri: string,
  targetSizeKB: number,
  maxIterations: number = 5
): Promise<ProcessedImage> => {
  try {
    let quality = DEFAULT_QUALITY;
    let processedImage: ProcessedImage | null = null;
    let iteration = 0;

    while (iteration < maxIterations) {
      processedImage = await processImage(imageUri, {
        maxWidth: DEFAULT_MAX_WIDTH,
        maxHeight: DEFAULT_MAX_HEIGHT,
        quality,
      });

      const fileSizeKB = processedImage.size / 1024;

      // Check if size is within target
      if (fileSizeKB <= targetSizeKB) {
        break;
      }

      // Reduce quality for next iteration
      quality = Math.max(10, quality - 15);
      iteration++;
    }

    if (!processedImage) {
      throw new Error('Failed to compress image');
    }

    return processedImage;
  } catch (error) {
    console.error('Failed to compress image:', error);
    throw new Error('Failed to compress image to target size');
  }
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (
  width: number,
  height: number,
  minWidth: number = 100,
  minHeight: number = 100,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): { valid: boolean; error?: string } => {
  if (width < minWidth || height < minHeight) {
    return {
      valid: false,
      error: `Image dimensions must be at least ${minWidth}x${minHeight}`,
    };
  }

  if (width > maxWidth || height > maxHeight) {
    return {
      valid: false,
      error: `Image dimensions must not exceed ${maxWidth}x${maxHeight}`,
    };
  }

  return { valid: true };
};

/**
 * Get image file extension from MIME type
 */
export const getFileExtensionFromMimeType = (mimeType: string): string => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return mimeMap[mimeType.toLowerCase()] || 'jpg';
};

/**
 * Generate unique filename for image
 */
export const generateImageFilename = (
  originalName?: string,
  mimeType: string = 'image/jpeg'
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtensionFromMimeType(mimeType);

  if (originalName) {
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
  }

  return `image_${timestamp}_${randomString}.${extension}`;
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/chat/__tests__/imageProcessingService.test.ts

import {
  calculateAspectRatioDimensions,
  processImage,
  generateThumbnail,
  compressImageToTargetSize,
  validateImageDimensions,
  getFileExtensionFromMimeType,
  generateImageFilename,
} from '../imageProcessingService';
import ImageResizer from 'react-native-image-resizer';

jest.mock('react-native-image-resizer');

const mockImageResizer = ImageResizer as jest.Mocked<typeof ImageResizer>;

describe('imageProcessingService', () => {
  describe('calculateAspectRatioDimensions', () => {
    it('should maintain aspect ratio for landscape image', () => {
      const result = calculateAspectRatioDimensions(3000, 2000, 1920, 1920);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1280);
    });

    it('should maintain aspect ratio for portrait image', () => {
      const result = calculateAspectRatioDimensions(2000, 3000, 1920, 1920);

      expect(result.width).toBe(1280);
      expect(result.height).toBe(1920);
    });

    it('should not upscale smaller images', () => {
      const result = calculateAspectRatioDimensions(800, 600, 1920, 1920);

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should handle square images', () => {
      const result = calculateAspectRatioDimensions(2000, 2000, 1920, 1920);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1920);
    });

    it('should constrain to max dimensions', () => {
      const result = calculateAspectRatioDimensions(4000, 3000, 1920, 1080);

      expect(result.width).toBeLessThanOrEqual(1920);
      expect(result.height).toBeLessThanOrEqual(1080);
    });
  });

  describe('processImage', () => {
    it('should process image with default options', async () => {
      mockImageResizer.createResizedImage.mockResolvedValue({
        uri: 'file://resized.jpg',
        width: 1920,
        height: 1080,
        size: 204800,
        name: 'resized.jpg',
      });

      const result = await processImage('file://original.jpg');

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file://original.jpg',
        1920,
        1920,
        'JPEG',
        80,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );

      expect(result).toEqual({
        uri: 'file://resized.jpg',
        width: 1920,
        height: 1080,
        size: 204800,
        name: 'resized.jpg',
      });
    });

    it('should process image with custom options', async () => {
      mockImageResizer.createResizedImage.mockResolvedValue({
        uri: 'file://resized.png',
        width: 1024,
        height: 768,
        size: 102400,
        name: 'resized.png',
      });

      const result = await processImage('file://original.png', {
        maxWidth: 1024,
        maxHeight: 768,
        quality: 90,
        compressFormat: 'PNG',
      });

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file://original.png',
        1024,
        768,
        'PNG',
        90,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );

      expect(result.width).toBe(1024);
      expect(result.height).toBe(768);
    });

    it('should throw error on processing failure', async () => {
      mockImageResizer.createResizedImage.mockRejectedValue(new Error('Processing failed'));

      await expect(processImage('file://invalid.jpg')).rejects.toThrow('Failed to process image');
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with default size', async () => {
      mockImageResizer.createResizedImage.mockResolvedValue({
        uri: 'file://thumbnail.jpg',
        width: 200,
        height: 200,
        size: 20480,
        name: 'thumbnail.jpg',
      });

      const result = await generateThumbnail('file://original.jpg');

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file://original.jpg',
        200,
        200,
        'JPEG',
        70,
        0,
        undefined,
        false,
        { mode: 'cover' }
      );

      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('should generate thumbnail with custom size', async () => {
      mockImageResizer.createResizedImage.mockResolvedValue({
        uri: 'file://thumbnail.jpg',
        width: 300,
        height: 300,
        size: 30720,
        name: 'thumbnail.jpg',
      });

      const result = await generateThumbnail('file://original.jpg', {
        width: 300,
        height: 300,
        quality: 80,
      });

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file://original.jpg',
        300,
        300,
        'JPEG',
        80,
        0,
        undefined,
        false,
        { mode: 'cover' }
      );
    });
  });

  describe('compressImageToTargetSize', () => {
    it('should compress image to target size', async () => {
      mockImageResizer.createResizedImage
        .mockResolvedValueOnce({
          uri: 'file://compressed.jpg',
          width: 1920,
          height: 1080,
          size: 1024000, // 1000 KB
          name: 'compressed.jpg',
        })
        .mockResolvedValueOnce({
          uri: 'file://compressed.jpg',
          width: 1920,
          height: 1080,
          size: 512000, // 500 KB
          name: 'compressed.jpg',
        });

      const result = await compressImageToTargetSize('file://original.jpg', 600);

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledTimes(2);
      expect(result.size).toBeLessThanOrEqual(600 * 1024);
    });

    it('should stop after max iterations', async () => {
      mockImageResizer.createResizedImage.mockResolvedValue({
        uri: 'file://compressed.jpg',
        width: 1920,
        height: 1080,
        size: 2048000, // 2 MB (always too large)
        name: 'compressed.jpg',
      });

      const result = await compressImageToTargetSize('file://original.jpg', 500, 3);

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledTimes(3);
    });
  });

  describe('validateImageDimensions', () => {
    it('should validate valid dimensions', () => {
      const result = validateImageDimensions(1920, 1080);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject dimensions below minimum', () => {
      const result = validateImageDimensions(50, 50, 100, 100);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 100x100');
    });

    it('should reject dimensions above maximum', () => {
      const result = validateImageDimensions(5000, 5000, 100, 100, 4096, 4096);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('must not exceed 4096x4096');
    });

    it('should use default limits', () => {
      const result = validateImageDimensions(2000, 2000);

      expect(result.valid).toBe(true);
    });
  });

  describe('getFileExtensionFromMimeType', () => {
    it('should return correct extension for JPEG', () => {
      expect(getFileExtensionFromMimeType('image/jpeg')).toBe('jpg');
      expect(getFileExtensionFromMimeType('image/jpg')).toBe('jpg');
    });

    it('should return correct extension for PNG', () => {
      expect(getFileExtensionFromMimeType('image/png')).toBe('png');
    });

    it('should return correct extension for WEBP', () => {
      expect(getFileExtensionFromMimeType('image/webp')).toBe('webp');
    });

    it('should return default extension for unknown type', () => {
      expect(getFileExtensionFromMimeType('image/unknown')).toBe('jpg');
    });

    it('should handle case insensitivity', () => {
      expect(getFileExtensionFromMimeType('IMAGE/JPEG')).toBe('jpg');
    });
  });

  describe('generateImageFilename', () => {
    it('should generate filename with original name', () => {
      const filename = generateImageFilename('photo.jpg', 'image/jpeg');

      expect(filename).toMatch(/^photo_\d+_[a-z0-9]+\.jpg$/);
    });

    it('should generate filename without original name', () => {
      const filename = generateImageFilename(undefined, 'image/png');

      expect(filename).toMatch(/^image_\d+_[a-z0-9]+\.png$/);
    });

    it('should use correct extension from MIME type', () => {
      const filename = generateImageFilename('photo', 'image/webp');

      expect(filename).toMatch(/^photo_\d+_[a-z0-9]+\.webp$/);
    });

    it('should generate unique filenames', () => {
      const filename1 = generateImageFilename('photo.jpg');
      const filename2 = generateImageFilename('photo.jpg');

      expect(filename1).not.toBe(filename2);
    });
  });
});
```

---

## Dependencies

- react-native-image-resizer (image processing)

---

## Definition of Done

- [ ] Image processing service implemented
- [ ] Resize functionality working
- [ ] Compress functionality working
- [ ] Thumbnail generation working
- [ ] Aspect ratio maintained
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-049](../stories/US-049-image-file-attachments.md), [TASK-278](TASK-278-attachment-picker.md), [TASK-280](TASK-280-supabase-storage-upload.md)
