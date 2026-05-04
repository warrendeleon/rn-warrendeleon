import Config from 'react-native-config';
import RNFS from 'react-native-fs';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { decode as atob } from 'base-64';

import { isE2EMockEnabled } from '@app/config/e2e';
import { SupabaseAuthClient } from '@app/httpClients/SupabaseAuthClient';
import { type SupabaseUploadResponse, SupabaseUploadResponseSchema } from '@app/schemas';
import { logDebug, logError, logWarning } from '@app/utils/logger';
import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { validateResponse } from '@app/utils/validation/validateResponse';

/**
 * Supabase Storage Client (REST API)
 *
 * Handles profile picture uploads to Supabase Storage:
 * - Authenticated uploads with Bearer token
 * - Automatic retry with exponential backoff (3 attempts)
 * - Delete old picture before uploading new
 * - File naming: {userId}/profile-{timestamp}.jpg
 * - E2E mocking support
 */

/** Storage bucket name for profile pictures */
const BUCKET_NAME = 'profile-pictures';

/** Maximum number of upload retry attempts */
const MAX_RETRIES = 3;

/** Base delay between retries in milliseconds */
const RETRY_BASE_DELAY_MS = 1000;

/** Upload result interface */
export interface UploadResult {
  /** Whether the upload succeeded */
  success: boolean;
  /** Public URL of the uploaded file */
  publicUrl: string | null;
  /** File path within the bucket */
  filePath: string | null;
  /** Error message if upload failed */
  error?: string;
}

/** Delete result interface */
export interface DeleteResult {
  /** Whether the delete succeeded */
  success: boolean;
  /** Error message if delete failed */
  error?: string;
}

/** Request config with retry flag */
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/** Storage error codes */
export type StorageErrorCode =
  | 'UPLOAD_FAILED'
  | 'DELETE_FAILED'
  | 'FILE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'INVALID_FILE';

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  public readonly code: StorageErrorCode;

  constructor(message: string, code: StorageErrorCode) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }
}

class SupabaseStorageClientClass {
  private axiosInstance: AxiosInstance;

  // E2E mock tracking
  private mockState = {
    upload: { mocked: false, filePath: null as string | null },
    delete: { mocked: false, filePath: null as string | null },
  };

  constructor() {
    // Create Axios instance for storage API
    this.axiosInstance = axios.create({
      baseURL: `${Config.SUPABASE_URL}/storage/v1`,
      timeout: 30000, // 30 second timeout for uploads
      headers: {
        apikey: Config.SUPABASE_ANON_KEY,
      },
    });

    // Request interceptor: Add access token. Goes through SupabaseAuthClient
    // so this client benefits from the in-memory token cache and avoids
    // hitting the Keychain (with biometric access control) on every upload.
    this.axiosInstance.interceptors.request.use(
      async config => {
        const accessToken = await SupabaseAuthClient.getAccessToken();

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor: Handle 401/403 and refresh token
    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Check for token expiry errors (401 or 403 with jwt errors)
        const status = error.response?.status;
        const errorData = error.response?.data as
          | {
              error_code?: string;
              msg?: string;
              message?: string;
            }
          | undefined;
        const errorMessage = errorData?.msg || errorData?.message || '';
        const isTokenExpired =
          status === 401 ||
          (status === 403 &&
            (errorData?.error_code === 'bad_jwt' ||
              errorMessage.includes('token is expired') ||
              errorMessage.includes('exp')));

        if (isTokenExpired && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            logDebug('Storage: Token expired, refreshing session...');

            // Refresh session via auth client (single-flight: concurrent
            // 401s from this client and the auth client share one POST).
            await SupabaseAuthClient.refreshSession();

            // Read the new token via getAccessToken so we hit the cache
            // populated by storeSession() inside the refresh, not the
            // Keychain (with biometric access control).
            const newAccessToken = await SupabaseAuthClient.getAccessToken();

            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              logDebug('Storage: Session refreshed, retrying request');
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            logError('Storage: Failed to refresh session', refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Upload a profile picture
   *
   * Flow:
   * 1. Upload new picture with unique filename
   * 2. Store public URL in EncryptedStore
   *
   * Note: Old picture cleanup is handled by a database trigger that queues
   * the old file path when the user's profile_picture is updated. A scheduled
   * Edge Function processes the cleanup queue.
   *
   * @param userId - User's UUID
   * @param localFilePath - Path to the local image file
   * @returns Promise<UploadResult> - Upload result with public URL
   */
  async uploadProfilePicture(userId: string, localFilePath: string): Promise<UploadResult> {
    // E2E mock: Return mock result without network call
    if (isE2EMockEnabled()) {
      const mockFilePath = `${userId}/profile-${Date.now()}.jpg`;
      const mockPublicUrl = `https://mock-storage.supabase.co/${BUCKET_NAME}/${mockFilePath}`;

      this.mockState.upload = { mocked: true, filePath: mockFilePath };

      // Store mock URL in EncryptedStore
      await EncryptedStore.set(EncryptedStoreKey.PROFILE_PICTURE_URL, mockPublicUrl);

      logDebug('uploadProfilePicture: E2E mock enabled, returning mock result');
      return {
        success: true,
        publicUrl: mockPublicUrl,
        filePath: mockFilePath,
      };
    }

    try {
      // 1. Generate unique filename
      const timestamp = Date.now();
      const filePath = `${userId}/profile-${timestamp}.jpg`;

      logDebug('Uploading profile picture', { userId, filePath });

      // 2. Read file as base64
      const cleanPath = localFilePath.replace(/^file:\/\//, '');
      const base64Content = await RNFS.readFile(cleanPath, 'base64');

      // 3. Upload with retry logic
      await this.uploadWithRetry(filePath, base64Content);

      // 4. Get public URL
      const publicUrl = this.getPublicUrl(filePath);

      // 5. Store URL in EncryptedStore
      await EncryptedStore.set(EncryptedStoreKey.PROFILE_PICTURE_URL, publicUrl);

      logDebug('Profile picture uploaded successfully', { filePath, publicUrl });

      return {
        success: true,
        publicUrl,
        filePath,
      };
    } catch (error) {
      logError('Failed to upload profile picture', error);
      return {
        success: false,
        publicUrl: null,
        filePath: null,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Delete a profile picture
   *
   * @param userId - User's UUID (for logging)
   * @param filePath - File path within the bucket
   * @returns Promise<DeleteResult> - Delete result
   */
  async deleteProfilePicture(userId: string, filePath: string): Promise<DeleteResult> {
    // E2E mock: Return success without network call
    if (isE2EMockEnabled()) {
      this.mockState.delete = { mocked: true, filePath };

      // Clear stored URL
      await EncryptedStore.remove(EncryptedStoreKey.PROFILE_PICTURE_URL);

      logDebug('deleteProfilePicture: E2E mock enabled, returning success');
      return { success: true };
    }

    try {
      logDebug('Deleting profile picture', { userId, filePath });

      await this.axiosInstance.delete(`/object/${BUCKET_NAME}/${filePath}`);

      // Clear stored URL
      await EncryptedStore.remove(EncryptedStoreKey.PROFILE_PICTURE_URL);

      logDebug('Profile picture deleted successfully', { filePath });
      return { success: true };
    } catch (error) {
      // 404 is acceptable (file already deleted)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logWarning('Profile picture not found (already deleted)', { filePath });
        return { success: true };
      }

      logError('Failed to delete profile picture', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  /**
   * Get public URL for a file in the bucket
   *
   * @param filePath - File path within the bucket
   * @returns string - Public URL
   */
  getPublicUrl(filePath: string): string {
    return `${Config.SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
  }

  /**
   * Extract file path from public URL
   *
   * @param publicUrl - Public URL of the file
   * @returns string | null - File path or null if URL format is invalid
   */
  extractFilePath(publicUrl: string): string | null {
    try {
      const pattern = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const index = publicUrl.indexOf(pattern);

      if (index === -1) {
        return null;
      }

      return publicUrl.substring(index + pattern.length);
    } catch {
      return null;
    }
  }

  /**
   * Get currently stored profile picture URL
   *
   * @returns Promise<string | null> - Stored URL or null
   */
  async getStoredProfilePictureUrl(): Promise<string | null> {
    return EncryptedStore.get(EncryptedStoreKey.PROFILE_PICTURE_URL);
  }

  /**
   * Upload file with automatic retry and exponential backoff
   *
   * @param filePath - Target path in bucket
   * @param base64Content - File content as base64
   * @returns Promise<SupabaseUploadResponse> - Upload response
   */
  private async uploadWithRetry(
    filePath: string,
    base64Content: string
  ): Promise<SupabaseUploadResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logDebug(`Upload attempt ${attempt}/${MAX_RETRIES}`, { filePath });

        // Convert base64 to binary buffer using base-64 package (RN compatible)
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const { data } = await this.axiosInstance.post(
          `/object/${BUCKET_NAME}/${filePath}`,
          bytes,
          {
            headers: {
              'Content-Type': 'image/jpeg',
              'x-upsert': 'true', // Overwrite if exists
            },
          }
        );

        // Validate response
        return validateResponse(SupabaseUploadResponseSchema, data, 'Supabase Storage upload');
      } catch (error) {
        lastError = error as Error;
        logWarning(`Upload attempt ${attempt} failed`, { error });

        // Don't retry on 4xx errors (client errors)
        if (axios.isAxiosError(error) && error.response?.status) {
          const status = error.response.status;
          if (status >= 400 && status < 500) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          logDebug(`Waiting ${delay}ms before retry`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Upload failed after all retries');
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract user-friendly error message from error
   */
  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      switch (axiosError.response?.status) {
        case 401:
          return 'Session expired. Please log in again.';
        case 403:
          return 'You do not have permission to upload files.';
        case 413:
          return 'File is too large. Please choose a smaller image.';
        case 404:
          return 'Storage service unavailable. Please try again.';
        default:
          if (axiosError.code === 'ECONNABORTED') {
            return 'Upload timed out. Please check your connection.';
          }
          if (axiosError.code === 'ERR_NETWORK') {
            return 'Network error. Please check your connection.';
          }
          return 'Failed to upload. Please try again.';
      }
    }

    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }

  /**
   * Verify mock status (for E2E testing)
   */
  async verifyMockStatus(): Promise<{ mocked: boolean }> {
    if (isE2EMockEnabled()) {
      return { mocked: true };
    }
    return { mocked: false };
  }

  /**
   * Get mock state (for E2E testing)
   */
  getMockState(): typeof this.mockState {
    return this.mockState;
  }

  /**
   * Reset mock state (for E2E testing)
   */
  resetMockState(): void {
    this.mockState = {
      upload: { mocked: false, filePath: null },
      delete: { mocked: false, filePath: null },
    };
  }
}

export const SupabaseStorageClient = new SupabaseStorageClientClass();
