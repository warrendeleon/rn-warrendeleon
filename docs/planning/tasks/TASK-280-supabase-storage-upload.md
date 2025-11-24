# TASK-280: Supabase Storage Upload

**ID**: TASK-280 | **Epic**: [EPIC-025](../epics/EPIC-025-chat.md) | **User Story**: [US-049](../stories/US-049-image-file-attachments.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Chat/
├── api/
│   └── storage.ts
└── hooks/
    └── useFileUpload.ts
```

**Note**: Storage upload service is Chat-specific, co-located within the Chat feature. Uses custom REST API (NO Supabase SDK) for file uploads.

---

## Task Description

Create service to upload attachments to Supabase Storage using custom REST API. Support upload progress tracking, error handling, retry logic, and generating public URLs for uploaded files.

---

## Acceptance Criteria

- [ ] Storage upload service created in `src/features/Chat/api/storage.ts`
- [ ] Upload images to Supabase Storage
- [ ] Upload files to Supabase Storage
- [ ] Track upload progress
- [ ] Generate public URLs
- [ ] Custom REST API integration (no SDK)
- [ ] Retry logic on failure
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### Storage Upload Service

```typescript
// src/features/Chat/api/storage.ts

import axios, { AxiosError, AxiosProgressEvent } from 'axios';
import { z } from 'zod';
import { SecureStore } from '@app/utils/storage/SecureStore';
import RNFS from 'react-native-fs';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_STORAGE_BUCKET = 'chat-attachments';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  maxRetries?: number;
}

/**
 * Generate unique file path for storage
 */
export const generateStorageFilePath = (
  userId: string,
  conversationId: string,
  filename: string
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop() || 'bin';
  const baseName = filename.replace(/\.[^/.]+$/, '');

  return `${userId}/${conversationId}/${baseName}_${timestamp}_${randomString}.${extension}`;
};

/**
 * Read file as base64
 */
const readFileAsBase64 = async (fileUri: string): Promise<string> => {
  try {
    const base64 = await RNFS.readFile(fileUri, 'base64');
    return base64;
  } catch (error) {
    console.error('Failed to read file:', error);
    throw new Error('Failed to read file');
  }
};

/**
 * Read file as binary
 */
const readFileAsBinary = async (fileUri: string): Promise<ArrayBuffer> => {
  try {
    const base64 = await RNFS.readFile(fileUri, 'base64');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  } catch (error) {
    console.error('Failed to read file as binary:', error);
    throw new Error('Failed to read file as binary');
  }
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  fileUri: string,
  filePath: string,
  mimeType: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const { onProgress, maxRetries = 3 } = options;

    const accessToken = await SecureStore.get('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Read file
    const fileData = await readFileAsBinary(fileUri);

    // Upload to Supabase Storage
    const response = await axios.post(
      `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${filePath}`,
      fileData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': mimeType,
        },
        timeout: 60000, // 60 seconds for large files
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);

            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage,
            });
          }
        },
      }
    );

    // Generate public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${filePath}`;

    return {
      path: filePath,
      publicUrl,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      if (axiosError.response?.status === 413) {
        throw new Error('File size exceeds maximum limit');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to upload file');
    }

    throw error;
  }
};

/**
 * Upload file with retry logic
 */
export const uploadFileWithRetry = async (
  fileUri: string,
  filePath: string,
  mimeType: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { maxRetries = 3 } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await uploadFile(fileUri, filePath, mimeType, options);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (
        lastError.message === 'Authentication required' ||
        lastError.message === 'Not authenticated'
      ) {
        throw lastError;
      }

      // Don't retry on file size errors
      if (lastError.message === 'File size exceeds maximum limit') {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to upload file after multiple attempts');
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const accessToken = await SecureStore.get('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    await axios.delete(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${filePath}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      timeout: 10000,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error: string; message: string }>;

      if (axiosError.response?.status === 401) {
        throw new Error('Authentication required');
      }

      if (axiosError.response?.status === 404) {
        throw new Error('File not found');
      }

      throw new Error(axiosError.response?.data?.message || 'Failed to delete file');
    }

    throw error;
  }
};

/**
 * Get public URL for file
 */
export const getPublicUrl = (filePath: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${filePath}`;
};
```

---

### Usage Hook

```typescript
// src/features/Chat/hooks/useFileUpload.ts

import { useState, useCallback } from 'react';
import {
  uploadFileWithRetry,
  generateStorageFilePath,
  UploadProgress,
  UploadResult,
} from '../api/storage';

export interface UseFileUploadReturn {
  uploadFile: (
    fileUri: string,
    fileName: string,
    mimeType: string,
    userId: string,
    conversationId: string
  ) => Promise<UploadResult>;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  uploadError: string | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      fileUri: string,
      fileName: string,
      mimeType: string,
      userId: string,
      conversationId: string
    ): Promise<UploadResult> => {
      try {
        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(null);

        const filePath = generateStorageFilePath(userId, conversationId, fileName);

        const result = await uploadFileWithRetry(fileUri, filePath, mimeType, {
          onProgress: progress => {
            setUploadProgress(progress);
          },
          maxRetries: 3,
        });

        setIsUploading(false);
        return result;
      } catch (error) {
        setIsUploading(false);
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
        setUploadError(errorMessage);
        throw error;
      }
    },
    []
  );

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    uploadError,
  };
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Chat/api/__tests__/storage.test.ts

import axios from 'axios';
import RNFS from 'react-native-fs';
import {
  generateStorageFilePath,
  uploadFile,
  uploadFileWithRetry,
  deleteFile,
  getPublicUrl,
} from '../storage';
import { SecureStore } from '@app/utils/storage/SecureStore';

jest.mock('axios');
jest.mock('react-native-fs');
jest.mock('@app/utils/storage/SecureStore');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('storageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.get.mockResolvedValue('mock-access-token');
  });

  describe('generateStorageFilePath', () => {
    it('should generate unique storage path', () => {
      const path1 = generateStorageFilePath('user-1', 'conv-123', 'photo.jpg');
      const path2 = generateStorageFilePath('user-1', 'conv-123', 'photo.jpg');

      expect(path1).toMatch(/^user-1\/conv-123\/photo_\d+_[a-z0-9]+\.jpg$/);
      expect(path2).toMatch(/^user-1\/conv-123\/photo_\d+_[a-z0-9]+\.jpg$/);
      expect(path1).not.toBe(path2);
    });

    it('should preserve file extension', () => {
      const path = generateStorageFilePath('user-1', 'conv-123', 'document.pdf');

      expect(path).toMatch(/\.pdf$/);
    });

    it('should handle files without extension', () => {
      const path = generateStorageFilePath('user-1', 'conv-123', 'file');

      expect(path).toMatch(/\.bin$/);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      mockRNFS.readFile.mockResolvedValue('base64data');

      mockAxios.post.mockResolvedValue({
        data: { path: 'user-1/conv-123/photo.jpg' },
      });

      const result = await uploadFile(
        'file://photo.jpg',
        'user-1/conv-123/photo.jpg',
        'image/jpeg'
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/storage/v1/object/'),
        expect.any(ArrayBuffer),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
            'Content-Type': 'image/jpeg',
          }),
        })
      );

      expect(result.path).toBe('user-1/conv-123/photo.jpg');
      expect(result.publicUrl).toContain('user-1/conv-123/photo.jpg');
    });

    it('should track upload progress', async () => {
      mockRNFS.readFile.mockResolvedValue('base64data');

      const onProgress = jest.fn();

      mockAxios.post.mockImplementation((url, data, config) => {
        // Simulate progress
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 } as any);
          config.onUploadProgress({ loaded: 100, total: 100 } as any);
        }

        return Promise.resolve({
          data: { path: 'user-1/conv-123/photo.jpg' },
        });
      });

      await uploadFile('file://photo.jpg', 'user-1/conv-123/photo.jpg', 'image/jpeg', {
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 50,
        total: 100,
        percentage: 50,
      });

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 100,
        total: 100,
        percentage: 100,
      });
    });

    it('should throw error when not authenticated', async () => {
      mockSecureStore.get.mockResolvedValue(null);

      await expect(
        uploadFile('file://photo.jpg', 'path/to/file.jpg', 'image/jpeg')
      ).rejects.toThrow('Not authenticated');
    });

    it('should throw error on 413 (file too large)', async () => {
      mockRNFS.readFile.mockResolvedValue('base64data');

      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: { status: 413 },
      });

      await expect(
        uploadFile('file://photo.jpg', 'path/to/file.jpg', 'image/jpeg')
      ).rejects.toThrow('File size exceeds maximum limit');
    });
  });

  describe('uploadFileWithRetry', () => {
    it('should retry on failure', async () => {
      mockRNFS.readFile.mockResolvedValue('base64data');

      // Fail first two attempts, succeed on third
      mockAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { path: 'user-1/conv-123/photo.jpg' },
        });

      const result = await uploadFileWithRetry(
        'file://photo.jpg',
        'user-1/conv-123/photo.jpg',
        'image/jpeg',
        { maxRetries: 3 }
      );

      expect(mockAxios.post).toHaveBeenCalledTimes(3);
      expect(result.path).toBe('user-1/conv-123/photo.jpg');
    });

    it('should not retry on authentication error', async () => {
      mockSecureStore.get.mockResolvedValue(null);

      await expect(
        uploadFileWithRetry('file://photo.jpg', 'path/to/file.jpg', 'image/jpeg')
      ).rejects.toThrow('Not authenticated');

      expect(mockAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockAxios.delete.mockResolvedValue({ data: {} });

      await deleteFile('user-1/conv-123/photo.jpg');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/storage/v1/object/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        })
      );
    });

    it('should throw error on 404', async () => {
      mockAxios.delete.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });

      await expect(deleteFile('path/to/file.jpg')).rejects.toThrow('File not found');
    });
  });

  describe('getPublicUrl', () => {
    it('should generate correct public URL', () => {
      const url = getPublicUrl('user-1/conv-123/photo.jpg');

      expect(url).toContain('/storage/v1/object/public/');
      expect(url).toContain('user-1/conv-123/photo.jpg');
    });
  });
});
```

---

## Dependencies

- Axios (HTTP client)
- react-native-fs (file system access)
- Zod (runtime validation)
- SecureStore utility (access token retrieval from TASK-196)

---

## Definition of Done

- [ ] Storage upload service implemented
- [ ] Upload functionality working
- [ ] Progress tracking working
- [ ] Public URL generation working
- [ ] Retry logic working
- [ ] Delete functionality working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-049](../stories/US-049-image-file-attachments.md), [TASK-279](TASK-279-image-processing.md), [TASK-281](TASK-281-attachment-message-bubble.md)
