# TASK-246: Supabase Storage Upload for Profile Pictures

**ID**: TASK-246 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-042](../stories/US-042-update-profile-picture.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Implement Supabase Storage integration for uploading profile pictures. Use custom REST API (no Supabase SDK) to upload images to Storage bucket, generate public URLs, update user profile in database, and handle upload progress callbacks.

---

## Acceptance Criteria

- [ ] Supabase Storage bucket created (`profile-pictures`)
- [ ] Bucket configured with public read access
- [ ] Upload function with progress callback
- [ ] Unique filename generation (user_id + timestamp)
- [ ] Old profile picture deletion before uploading new one
- [ ] Public URL generation
- [ ] User profile update (profile_picture_url)
- [ ] Error handling for upload failures
- [ ] TypeScript type definitions
- [ ] 100% unit test coverage

---

## Implementation Details

### Supabase Storage Bucket Setup

**Manual setup in Supabase Dashboard**:

1. Go to Storage > Create bucket
2. Bucket name: `profile-pictures`
3. Public bucket: Yes
4. File size limit: 5MB
5. Allowed MIME types: image/jpeg, image/png

**RLS Policies**:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all profile pictures
CREATE POLICY "Profile pictures are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

### Profile Service

```typescript
// src/services/profile/profileService.ts

import axios, { AxiosProgressEvent } from 'axios';
import Config from 'react-native-config';
import * as Keychain from 'react-native-keychain';
import { processProfilePicture } from '../media/imageProcessingService';

/**
 * Supabase Storage configuration
 */
const STORAGE_CONFIG = {
  BUCKET_NAME: 'profile-pictures',
  BASE_URL: `${Config.SUPABASE_URL}/storage/v1/object`,
};

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Generates a unique filename for profile picture
 *
 * @param userId - User ID
 * @param extension - File extension (e.g., 'jpg')
 * @returns Unique filename
 */
const generateFileName = (userId: string, extension: string = 'jpg'): string => {
  const timestamp = Date.now();
  return `${userId}/${timestamp}.${extension}`;
};

/**
 * Gets the access token from Keychain
 */
const getAccessToken = async (): Promise<string> => {
  const credentials = await Keychain.getGenericPassword({
    service: 'access_token',
  });

  if (!credentials) {
    throw new Error('No access token found. Please log in again.');
  }

  return credentials.password;
};

/**
 * Deletes old profile picture from Supabase Storage
 *
 * @param profilePictureUrl - Current profile picture URL
 */
const deleteOldProfilePicture = async (profilePictureUrl: string | null): Promise<void> => {
  if (!profilePictureUrl) return;

  try {
    // Extract filename from URL
    const urlParts = profilePictureUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];

    if (!fileName || !userId) {
      console.warn('Could not parse profile picture URL:', profilePictureUrl);
      return;
    }

    const accessToken = await getAccessToken();
    const filePath = `${userId}/${fileName}`;

    await axios.delete(`${STORAGE_CONFIG.BASE_URL}/${STORAGE_CONFIG.BUCKET_NAME}/${filePath}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: Config.SUPABASE_ANON_KEY,
      },
    });

    console.log('Old profile picture deleted:', filePath);
  } catch (error: any) {
    console.error('Failed to delete old profile picture:', error);
    // Don't throw error - deletion failure shouldn't block new upload
  }
};

/**
 * Uploads profile picture to Supabase Storage
 *
 * @param imageUri - Local image URI
 * @param onProgress - Progress callback
 * @returns Promise resolving to public URL
 *
 * @example
 * const url = await uploadProfilePicture('file:///image.jpg', (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 */
export const uploadProfilePicture = async (
  imageUri: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  try {
    // Step 1: Process image (resize, compress)
    const processed = await processProfilePicture(imageUri);

    // Step 2: Get access token and user ID
    const accessToken = await getAccessToken();
    const userCredentials = await Keychain.getGenericPassword({
      service: 'user_id',
    });

    if (!userCredentials) {
      throw new Error('User ID not found');
    }

    const userId = userCredentials.password;

    // Step 3: Delete old profile picture (if exists)
    const oldProfilePictureUrl = await getCurrentProfilePictureUrl(userId);
    await deleteOldProfilePicture(oldProfilePictureUrl);

    // Step 4: Generate unique filename
    const fileName = generateFileName(userId, 'jpg');

    // Step 5: Create FormData
    const formData = new FormData();
    formData.append('file', {
      uri: processed.uri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    // Step 6: Upload to Supabase Storage
    const uploadResponse = await axios.post(
      `${STORAGE_CONFIG.BASE_URL}/${STORAGE_CONFIG.BUCKET_NAME}/${fileName}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: Config.SUPABASE_ANON_KEY,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      }
    );

    // Step 7: Generate public URL
    const publicUrl = `${Config.SUPABASE_URL}/storage/v1/object/public/${STORAGE_CONFIG.BUCKET_NAME}/${fileName}`;

    // Step 8: Update user profile in database
    await updateUserProfilePicture(userId, publicUrl, accessToken);

    return publicUrl;
  } catch (error: any) {
    console.error('Failed to upload profile picture:', error);

    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to upload profile picture');
    }

    throw new Error(error.message || 'Failed to upload profile picture');
  }
};

/**
 * Gets current profile picture URL from encrypted storage
 */
const getCurrentProfilePictureUrl = async (userId: string): Promise<string | null> => {
  try {
    const EncryptedStorage = (await import('react-native-encrypted-storage')).default;
    const userData = await EncryptedStorage.getItem(`user_${userId}`);

    if (!userData) return null;

    const parsed = JSON.parse(userData);
    return parsed.profile_picture_url || null;
  } catch (error) {
    console.error('Failed to get current profile picture URL:', error);
    return null;
  }
};

/**
 * Updates user profile picture URL in Supabase database
 */
const updateUserProfilePicture = async (
  userId: string,
  profilePictureUrl: string,
  accessToken: string
): Promise<void> => {
  try {
    await axios.patch(
      `${Config.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`,
      { profile_picture_url: profilePictureUrl },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: Config.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
      }
    );

    // Update encrypted storage
    const EncryptedStorage = (await import('react-native-encrypted-storage')).default;
    const userData = await EncryptedStorage.getItem(`user_${userId}`);

    if (userData) {
      const parsed = JSON.parse(userData);
      parsed.profile_picture_url = profilePictureUrl;
      await EncryptedStorage.setItem(`user_${userId}`, JSON.stringify(parsed));
    }
  } catch (error: any) {
    console.error('Failed to update user profile picture:', error);
    throw new Error('Failed to update profile picture in database');
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/profile/__tests__/profileService.test.ts

import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { uploadProfilePicture } from '../profileService';
import * as imageProcessingService from '../../media/imageProcessingService';

jest.mock('axios');
jest.mock('react-native-keychain');
jest.mock('../../media/imageProcessingService');
jest.mock('react-native-encrypted-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;
const mockImageProcessing = imageProcessingService as jest.Mocked<typeof imageProcessingService>;

describe('profileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture successfully', async () => {
      // Mock processed image
      mockImageProcessing.processProfilePicture.mockResolvedValue({
        uri: 'file:///processed/image.jpg',
        width: 512,
        height: 512,
        size: 512000,
        name: 'profile.jpg',
      });

      // Mock tokens
      mockKeychain.getGenericPassword
        .mockResolvedValueOnce({
          service: 'access_token',
          username: 'access_token',
          password: 'test-access-token',
        })
        .mockResolvedValueOnce({
          service: 'user_id',
          username: 'user_id',
          password: 'user-123',
        });

      // Mock axios responses
      mockAxios.delete.mockResolvedValue({ status: 200 });
      mockAxios.post.mockResolvedValue({ status: 200, data: { Key: 'user-123/123456.jpg' } });
      mockAxios.patch.mockResolvedValue({ status: 204 });

      const progressCallback = jest.fn();
      const url = await uploadProfilePicture('file:///original/image.jpg', progressCallback);

      expect(mockImageProcessing.processProfilePicture).toHaveBeenCalledWith(
        'file:///original/image.jpg'
      );
      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.patch).toHaveBeenCalled();
      expect(url).toContain('profile-pictures');
    });

    it('should call progress callback during upload', async () => {
      mockImageProcessing.processProfilePicture.mockResolvedValue({
        uri: 'file:///processed/image.jpg',
        width: 512,
        height: 512,
        size: 512000,
        name: 'profile.jpg',
      });

      mockKeychain.getGenericPassword
        .mockResolvedValueOnce({
          service: 'access_token',
          username: 'access_token',
          password: 'test-access-token',
        })
        .mockResolvedValueOnce({
          service: 'user_id',
          username: 'user_id',
          password: 'user-123',
        });

      const progressCallback = jest.fn();

      mockAxios.post.mockImplementation((url, data, config) => {
        // Simulate upload progress
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 });
          config.onUploadProgress({ loaded: 100, total: 100 });
        }
        return Promise.resolve({ status: 200 });
      });

      mockAxios.delete.mockResolvedValue({ status: 200 });
      mockAxios.patch.mockResolvedValue({ status: 204 });

      await uploadProfilePicture('file:///original/image.jpg', progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });

    it('should throw error when upload fails', async () => {
      mockImageProcessing.processProfilePicture.mockResolvedValue({
        uri: 'file:///processed/image.jpg',
        width: 512,
        height: 512,
        size: 512000,
        name: 'profile.jpg',
      });

      mockKeychain.getGenericPassword
        .mockResolvedValueOnce({
          service: 'access_token',
          username: 'access_token',
          password: 'test-access-token',
        })
        .mockResolvedValueOnce({
          service: 'user_id',
          username: 'user_id',
          password: 'user-123',
        });

      mockAxios.delete.mockResolvedValue({ status: 200 });
      mockAxios.post.mockRejectedValue({
        response: { data: { message: 'Upload failed' } },
      });

      await expect(uploadProfilePicture('file:///original/image.jpg')).rejects.toThrow(
        'Upload failed'
      );
    });
  });
});
```

---

## Dependencies

- Axios (HTTP client)
- `react-native-keychain` (access token)
- `react-native-encrypted-storage` (user data)
- Image processing service (TASK-245)

---

## Definition of Done

- [ ] Supabase Storage bucket created and configured
- [ ] Upload function implemented with progress
- [ ] Old picture deletion working
- [ ] Database update working
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-042](../stories/US-042-update-profile-picture.md), [TASK-245](TASK-245-image-processing.md), [TASK-247](TASK-247-profile-picture-rntl-tests.md)
