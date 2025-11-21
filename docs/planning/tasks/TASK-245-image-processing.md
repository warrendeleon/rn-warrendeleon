# TASK-245: Image Processing (Resize, Compress, Optimize)

**ID**: TASK-245 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-042](../stories/US-042-update-profile-picture.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Implement image processing utilities to resize, compress, and optimize profile pictures before upload. Use `react-native-image-resizer` to reduce file size, standardize dimensions, and maintain acceptable quality for faster uploads and storage efficiency.

---

## Acceptance Criteria

- [ ] `react-native-image-resizer` library installed and configured
- [ ] Image resize function (max 512x512)
- [ ] Image compress function (quality 0.8)
- [ ] Image format conversion (to JPEG)
- [ ] File size validation (max 5MB)
- [ ] Maintain aspect ratio during resize
- [ ] Generate thumbnail (128x128)
- [ ] TypeScript type definitions
- [ ] 100% unit test coverage

---

## Implementation Details

### Installation

```bash
yarn add react-native-image-resizer
cd ios && pod install
```

### Image Processing Service

```typescript
// src/services/media/imageProcessingService.ts

import ImageResizer from 'react-native-image-resizer';

/**
 * Image processing configuration
 */
const IMAGE_CONFIG = {
  MAX_WIDTH: 512,
  MAX_HEIGHT: 512,
  THUMBNAIL_SIZE: 128,
  QUALITY: 80, // 0-100
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  FORMAT: 'JPEG' as const,
};

/**
 * Processed image result
 */
export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  name: string;
}

/**
 * Image processing error
 */
export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

/**
 * Validates image file size
 *
 * @param uri - Image URI
 * @throws ImageProcessingError if file is too large
 */
const validateFileSize = async (uri: string): Promise<void> => {
  // This is a simplified check - in production, you'd use RNFS to check actual file size
  // For now, we'll validate after processing
};

/**
 * Resizes and compresses an image for profile picture upload
 *
 * @param uri - Original image URI
 * @returns Promise resolving to ProcessedImage
 *
 * @example
 * const processed = await processProfilePicture('file:///path/to/image.jpg');
 * console.log('Processed URI:', processed.uri);
 * console.log('New size:', processed.size);
 */
export const processProfilePicture = async (uri: string): Promise<ProcessedImage> => {
  try {
    // Resize and compress image
    const resized = await ImageResizer.createResizedImage(
      uri,
      IMAGE_CONFIG.MAX_WIDTH,
      IMAGE_CONFIG.MAX_HEIGHT,
      IMAGE_CONFIG.FORMAT,
      IMAGE_CONFIG.QUALITY,
      0, // rotation
      undefined, // output path
      true // keep aspect ratio
    );

    // Validate file size
    if (resized.size && resized.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      throw new ImageProcessingError(
        `Image file size (${(resized.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (5MB). Please choose a smaller image.`
      );
    }

    return {
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
      size: resized.size || 0,
      name: resized.name || 'profile.jpg',
    };
  } catch (error: any) {
    console.error('Failed to process image:', error);

    if (error instanceof ImageProcessingError) {
      throw error;
    }

    throw new ImageProcessingError(
      error.message || 'Failed to process image. Please try a different image.'
    );
  }
};

/**
 * Creates a thumbnail from an image
 *
 * @param uri - Original image URI
 * @returns Promise resolving to ProcessedImage (thumbnail)
 *
 * @example
 * const thumbnail = await createThumbnail('file:///path/to/image.jpg');
 * console.log('Thumbnail URI:', thumbnail.uri);
 */
export const createThumbnail = async (uri: string): Promise<ProcessedImage> => {
  try {
    const resized = await ImageResizer.createResizedImage(
      uri,
      IMAGE_CONFIG.THUMBNAIL_SIZE,
      IMAGE_CONFIG.THUMBNAIL_SIZE,
      IMAGE_CONFIG.FORMAT,
      IMAGE_CONFIG.QUALITY,
      0,
      undefined,
      false // crop to square
    );

    return {
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
      size: resized.size || 0,
      name: resized.name || 'thumbnail.jpg',
    };
  } catch (error: any) {
    console.error('Failed to create thumbnail:', error);
    throw new ImageProcessingError(error.message || 'Failed to create thumbnail');
  }
};

/**
 * Processes image with custom dimensions
 *
 * @param uri - Original image URI
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - Quality (0-100)
 * @returns Promise resolving to ProcessedImage
 */
export const processImageWithDimensions = async (
  uri: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = IMAGE_CONFIG.QUALITY
): Promise<ProcessedImage> => {
  try {
    const resized = await ImageResizer.createResizedImage(
      uri,
      maxWidth,
      maxHeight,
      IMAGE_CONFIG.FORMAT,
      quality,
      0,
      undefined,
      true
    );

    return {
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
      size: resized.size || 0,
      name: resized.name || 'image.jpg',
    };
  } catch (error: any) {
    console.error('Failed to process image:', error);
    throw new ImageProcessingError(error.message || 'Failed to process image');
  }
};

/**
 * Converts image to base64 string
 *
 * @param uri - Image URI
 * @returns Promise resolving to base64 string
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // This would use RNFS to read the file and convert to base64
    // Placeholder for now
    throw new Error('Not implemented');
  } catch (error: any) {
    console.error('Failed to convert image to base64:', error);
    throw new ImageProcessingError('Failed to convert image to base64');
  }
};

/**
 * Gets image dimensions without processing
 *
 * @param uri - Image URI
 * @returns Promise resolving to { width, height }
 */
export const getImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  try {
    // This would use Image.getSize from React Native
    // Placeholder for now
    throw new Error('Not implemented');
  } catch (error: any) {
    console.error('Failed to get image dimensions:', error);
    throw new ImageProcessingError('Failed to get image dimensions');
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/media/__tests__/imageProcessingService.test.ts

import ImageResizer from 'react-native-image-resizer';
import {
  processProfilePicture,
  createThumbnail,
  processImageWithDimensions,
  ImageProcessingError,
} from '../imageProcessingService';

jest.mock('react-native-image-resizer');

const mockImageResizer = ImageResizer as jest.Mocked<typeof ImageResizer>;

describe('imageProcessingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processProfilePicture', () => {
    it('should resize and compress image successfully', async () => {
      const mockResult = {
        uri: 'file:///processed/image.jpg',
        width: 512,
        height: 512,
        size: 1024 * 500, // 500KB
        name: 'profile.jpg',
      };

      mockImageResizer.createResizedImage.mockResolvedValue(mockResult);

      const result = await processProfilePicture('file:///original/image.jpg');

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file:///original/image.jpg',
        512,
        512,
        'JPEG',
        80,
        0,
        undefined,
        true
      );

      expect(result).toEqual({
        uri: 'file:///processed/image.jpg',
        width: 512,
        height: 512,
        size: 512000,
        name: 'profile.jpg',
      });
    });

    it('should throw error when file size exceeds limit', async () => {
      const mockResult = {
        uri: 'file:///processed/image.jpg',
        width: 512,
        height: 512,
        size: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
        name: 'profile.jpg',
      };

      mockImageResizer.createResizedImage.mockResolvedValue(mockResult);

      await expect(processProfilePicture('file:///original/image.jpg')).rejects.toThrow(
        ImageProcessingError
      );
      await expect(processProfilePicture('file:///original/image.jpg')).rejects.toThrow(
        /exceeds maximum allowed size/
      );
    });

    it('should handle processing errors', async () => {
      mockImageResizer.createResizedImage.mockRejectedValue(new Error('Processing failed'));

      await expect(processProfilePicture('file:///original/image.jpg')).rejects.toThrow(
        ImageProcessingError
      );
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail successfully', async () => {
      const mockResult = {
        uri: 'file:///processed/thumbnail.jpg',
        width: 128,
        height: 128,
        size: 1024 * 50, // 50KB
        name: 'thumbnail.jpg',
      };

      mockImageResizer.createResizedImage.mockResolvedValue(mockResult);

      const result = await createThumbnail('file:///original/image.jpg');

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file:///original/image.jpg',
        128,
        128,
        'JPEG',
        80,
        0,
        undefined,
        false // crop to square
      );

      expect(result).toEqual({
        uri: 'file:///processed/thumbnail.jpg',
        width: 128,
        height: 128,
        size: 51200,
        name: 'thumbnail.jpg',
      });
    });

    it('should handle thumbnail creation errors', async () => {
      mockImageResizer.createResizedImage.mockRejectedValue(new Error('Thumbnail creation failed'));

      await expect(createThumbnail('file:///original/image.jpg')).rejects.toThrow(
        ImageProcessingError
      );
    });
  });

  describe('processImageWithDimensions', () => {
    it('should process image with custom dimensions', async () => {
      const mockResult = {
        uri: 'file:///processed/custom.jpg',
        width: 800,
        height: 600,
        size: 1024 * 800, // 800KB
        name: 'image.jpg',
      };

      mockImageResizer.createResizedImage.mockResolvedValue(mockResult);

      const result = await processImageWithDimensions('file:///original/image.jpg', 800, 600, 90);

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        'file:///original/image.jpg',
        800,
        600,
        'JPEG',
        90,
        0,
        undefined,
        true
      );

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should use default quality when not specified', async () => {
      const mockResult = {
        uri: 'file:///processed/custom.jpg',
        width: 1024,
        height: 768,
        size: 1024 * 1000,
        name: 'image.jpg',
      };

      mockImageResizer.createResizedImage.mockResolvedValue(mockResult);

      await processImageWithDimensions('file:///original/image.jpg', 1024, 768);

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        expect.any(String),
        1024,
        768,
        'JPEG',
        80, // default quality
        0,
        undefined,
        true
      );
    });
  });
});
```

---

## Dependencies

- `react-native-image-resizer` - Image resizing and compression

---

## Definition of Done

- [ ] Library installed and configured
- [ ] Image resize function implemented
- [ ] Image compress function implemented
- [ ] File size validation implemented
- [ ] Thumbnail generation implemented
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-042](../stories/US-042-update-profile-picture.md), [TASK-244](TASK-244-image-picker-integration.md), [TASK-246](TASK-246-supabase-storage-upload.md)
