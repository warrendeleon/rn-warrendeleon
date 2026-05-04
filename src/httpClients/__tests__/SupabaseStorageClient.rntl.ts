/**
 * Tests for SupabaseStorageClient
 *
 * Uses MSW (Mock Service Worker) to intercept HTTP requests.
 * Tests StorageError class, E2E mocking, and real upload/delete flows.
 */

import { http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';

import { StorageError, SupabaseStorageClient } from '../SupabaseStorageClient';

// Mock dependencies
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn(),
  exists: jest.fn(),
}));

jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

jest.mock('@app/utils/storage/EncryptedStore', () => ({
  EncryptedStore: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
  EncryptedStoreKey: {
    PROFILE_PICTURE_URL: 'profilePictureURL',
  },
}));

jest.mock('@app/utils/storage/SecureStore', () => ({
  SecureStore: {
    get: jest.fn().mockResolvedValue('mock-access-token'),
    set: jest.fn(),
  },
  SecureStoreKey: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
  },
}));

jest.mock('@app/httpClients/SupabaseAuthClient', () => ({
  SupabaseAuthClient: {
    refreshSession: jest.fn().mockResolvedValue({
      access_token: 'refreshed-access-token',
      refresh_token: 'refreshed-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
    }),
    getAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
  },
}));

jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

const SUPABASE_URL = 'https://test.supabase.co';
const BUCKET_NAME = 'profile-pictures';

describe('StorageError', () => {
  describe('constructor', () => {
    it('should create error with message and code', () => {
      const error = new StorageError('Upload failed', 'UPLOAD_FAILED');

      expect(error.message).toBe('Upload failed');
      expect(error.name).toBe('StorageError');
      expect(error.code).toBe('UPLOAD_FAILED');
    });

    it('should create error with DELETE_FAILED code', () => {
      const error = new StorageError('Delete failed', 'DELETE_FAILED');

      expect(error.code).toBe('DELETE_FAILED');
    });

    it('should create error with FILE_NOT_FOUND code', () => {
      const error = new StorageError('File not found', 'FILE_NOT_FOUND');

      expect(error.code).toBe('FILE_NOT_FOUND');
    });

    it('should create error with UNAUTHORIZED code', () => {
      const error = new StorageError('Unauthorized', 'UNAUTHORIZED');

      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create error with NETWORK_ERROR code', () => {
      const error = new StorageError('Network error', 'NETWORK_ERROR');

      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should create error with INVALID_FILE code', () => {
      const error = new StorageError('Invalid file', 'INVALID_FILE');

      expect(error.code).toBe('INVALID_FILE');
    });
  });

  describe('inheritance', () => {
    it('should be instanceof Error', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof StorageError', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(error).toBeInstanceOf(StorageError);
    });

    it('should have proper prototype chain', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(Object.getPrototypeOf(error)).toBe(StorageError.prototype);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('error handling patterns', () => {
    it('should be catchable as Error', () => {
      const throwAndCatch = () => {
        try {
          throw new StorageError('Test error', 'UPLOAD_FAILED');
        } catch (e) {
          if (e instanceof Error) {
            return e;
          }
          throw e;
        }
      };

      const caught = throwAndCatch();
      expect(caught).toBeInstanceOf(StorageError);
    });

    it('should support error code checking', () => {
      const error = new StorageError('Upload failed', 'UPLOAD_FAILED');

      const isUploadError = error.code === 'UPLOAD_FAILED';
      expect(isUploadError).toBe(true);
    });

    it('should have stack trace', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('StorageError');
    });
  });

  describe('serialisation', () => {
    it('converts to formatted string with error name prefix', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(error.toString()).toBe('StorageError: Test error');
    });

    it('serialises message and code properties to JSON format', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(JSON.stringify({ message: error.message, code: error.code })).toBe(
        '{"message":"Test error","code":"UPLOAD_FAILED"}'
      );
    });
  });
});

describe('SupabaseStorageClient', () => {
  describe('getPublicUrl', () => {
    it('should generate correct public URL', () => {
      const url = SupabaseStorageClient.getPublicUrl('user123/profile-123456.jpg');

      expect(url).toBe(
        'https://test.supabase.co/storage/v1/object/public/profile-pictures/user123/profile-123456.jpg'
      );
    });

    it('should handle nested paths', () => {
      const url = SupabaseStorageClient.getPublicUrl('users/abc/images/profile.jpg');

      expect(url).toContain('users/abc/images/profile.jpg');
    });
  });

  describe('extractFilePath', () => {
    it('should extract file path from public URL', () => {
      const publicUrl =
        'https://test.supabase.co/storage/v1/object/public/profile-pictures/user123/profile-123.jpg';

      const filePath = SupabaseStorageClient.extractFilePath(publicUrl);

      expect(filePath).toBe('user123/profile-123.jpg');
    });

    it('should return null for invalid URL format', () => {
      const invalidUrl = 'https://example.com/image.jpg';

      const filePath = SupabaseStorageClient.extractFilePath(invalidUrl);

      expect(filePath).toBeNull();
    });

    it('should return null for URL without bucket pattern', () => {
      const invalidUrl = 'https://test.supabase.co/storage/image.jpg';

      const filePath = SupabaseStorageClient.extractFilePath(invalidUrl);

      expect(filePath).toBeNull();
    });
  });

  describe('mock state management', () => {
    it('should reset mock state', () => {
      SupabaseStorageClient.resetMockState();

      const state = SupabaseStorageClient.getMockState();

      expect(state.upload.mocked).toBe(false);
      expect(state.upload.filePath).toBeNull();
      expect(state.delete.mocked).toBe(false);
      expect(state.delete.filePath).toBeNull();
    });
  });

  describe('verifyMockStatus', () => {
    const { isE2EMockEnabled } = require('@app/config/e2e');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return mocked: true when E2E mock is enabled', async () => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const result = await SupabaseStorageClient.verifyMockStatus();

      expect(result.mocked).toBe(true);
    });

    it('should return mocked: false when E2E mock is disabled', async () => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);

      const result = await SupabaseStorageClient.verifyMockStatus();

      expect(result.mocked).toBe(false);
    });
  });
});

describe('SupabaseStorageClient - uploadProfilePicture', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockFilePath = '/path/to/image.jpg';
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { EncryptedStore, EncryptedStoreKey } = require('@app/utils/storage/EncryptedStore');
  const RNFS = require('react-native-fs');

  beforeEach(() => {
    jest.clearAllMocks();
    SupabaseStorageClient.resetMockState();
    server.resetHandlers();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns mock result without network call', async () => {
      const result = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(true);
      expect(result.publicUrl).toContain('mock-storage.supabase.co');
      expect(result.filePath).toContain(mockUserId);
    });

    it('stores mock URL in EncryptedStore', async () => {
      await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.PROFILE_PICTURE_URL,
        expect.stringContaining('mock-storage.supabase.co')
      );
    });

    it('updates mock state tracking', async () => {
      await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      const mockState = SupabaseStorageClient.getMockState();
      expect(mockState.upload.mocked).toBe(true);
      expect(mockState.upload.filePath).toContain(mockUserId);
    });

    it('generates unique filename with timestamp', async () => {
      jest.useFakeTimers();

      const result1 = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      // Advance time to ensure different timestamps
      jest.advanceTimersByTime(100);

      const result2 = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result1.filePath).not.toBe(result2.filePath);

      jest.useRealTimers();
    });
  });

  describe('Real Upload Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
      (RNFS.readFile as jest.Mock).mockResolvedValue('SGVsbG8gV29ybGQ='); // "Hello World" in base64

      // Default success handler for uploads
      server.use(
        http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ Key: 'test-key' }, { status: 200 });
        })
      );
    });

    it('reads file as base64', async () => {
      await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(RNFS.readFile).toHaveBeenCalledWith(mockFilePath, 'base64');
    });

    it('handles file:// prefix in path', async () => {
      const fileUri = 'file:///path/to/image.jpg';

      await SupabaseStorageClient.uploadProfilePicture(mockUserId, fileUri);

      expect(RNFS.readFile).toHaveBeenCalledWith('/path/to/image.jpg', 'base64');
    });

    it('stores URL in EncryptedStore on success', async () => {
      const result = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(true);
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.PROFILE_PICTURE_URL,
        expect.stringContaining('test.supabase.co')
      );
    });

    it('returns error result on file read failure', async () => {
      (RNFS.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const result = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.publicUrl).toBeNull();
      expect(result.filePath).toBeNull();
    });

    it('returns error result on upload failure', async () => {
      jest.useFakeTimers();

      server.use(
        http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const resultPromise = SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
      (RNFS.readFile as jest.Mock).mockResolvedValue('SGVsbG8gV29ybGQ=');
    });

    it('returns user-friendly message for 401', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        })
      );

      const result = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session expired. Please log in again.');
    });

    it('returns user-friendly message for 403', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
        })
      );

      const result = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You do not have permission to upload files.');
    });

    it('returns user-friendly message for 413 (file too large)', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ error: 'Payload too large' }, { status: 413 });
        })
      );

      const result = await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File is too large. Please choose a smaller image.');
    });

    it('returns user-friendly message for network error', async () => {
      jest.useFakeTimers();

      server.use(
        http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.error();
        })
      );

      const resultPromise = SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      jest.useRealTimers();
    });
  });
});

describe('SupabaseStorageClient - deleteProfilePicture', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockFilePath = 'user123/profile-123456.jpg';
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { EncryptedStore, EncryptedStoreKey } = require('@app/utils/storage/EncryptedStore');

  beforeEach(() => {
    jest.clearAllMocks();
    SupabaseStorageClient.resetMockState();
    server.resetHandlers();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns success without network call', async () => {
      const result = await SupabaseStorageClient.deleteProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(true);
    });

    it('clears stored URL from EncryptedStore', async () => {
      await SupabaseStorageClient.deleteProfilePicture(mockUserId, mockFilePath);

      expect(EncryptedStore.remove).toHaveBeenCalledWith(EncryptedStoreKey.PROFILE_PICTURE_URL);
    });

    it('updates mock state tracking', async () => {
      await SupabaseStorageClient.deleteProfilePicture(mockUserId, mockFilePath);

      const mockState = SupabaseStorageClient.getMockState();
      expect(mockState.delete.mocked).toBe(true);
      expect(mockState.delete.filePath).toBe(mockFilePath);
    });
  });

  describe('Real Delete Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    });

    it('clears stored URL on success', async () => {
      server.use(
        http.delete(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({}, { status: 200 });
        })
      );

      const result = await SupabaseStorageClient.deleteProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(true);
      expect(EncryptedStore.remove).toHaveBeenCalledWith(EncryptedStoreKey.PROFILE_PICTURE_URL);
    });

    it('handles 404 as success (file already deleted)', async () => {
      server.use(
        http.delete(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        })
      );

      const result = await SupabaseStorageClient.deleteProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(true);
    });

    it('returns error for non-404 failures', async () => {
      server.use(
        http.delete(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 });
        })
      );

      const result = await SupabaseStorageClient.deleteProfilePicture(mockUserId, mockFilePath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe('SupabaseStorageClient - getStoredProfilePictureUrl', () => {
  const { EncryptedStore, EncryptedStoreKey } = require('@app/utils/storage/EncryptedStore');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns stored URL when present', async () => {
    const mockUrl =
      'https://test.supabase.co/storage/v1/object/public/profile-pictures/user/test.jpg';
    (EncryptedStore.get as jest.Mock).mockResolvedValue(mockUrl);

    const result = await SupabaseStorageClient.getStoredProfilePictureUrl();

    expect(result).toBe(mockUrl);
    expect(EncryptedStore.get).toHaveBeenCalledWith(EncryptedStoreKey.PROFILE_PICTURE_URL);
  });

  it('returns null when no URL stored', async () => {
    (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

    const result = await SupabaseStorageClient.getStoredProfilePictureUrl();

    expect(result).toBeNull();
  });
});

describe('SupabaseStorageClient - Retry Logic', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockFilePath = '/path/to/image.jpg';
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const RNFS = require('react-native-fs');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (RNFS.readFile as jest.Mock).mockResolvedValue('SGVsbG8gV29ybGQ=');
  });

  it('does NOT retry on 4xx errors (client errors)', async () => {
    let attempts = 0;

    server.use(
      http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
        attempts++;
        return HttpResponse.json({ error: 'Payload too large' }, { status: 413 });
      })
    );

    await SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

    // Should only attempt once for 4xx errors
    expect(attempts).toBe(1);
  });

  it('retries on 5xx errors with exponential backoff', async () => {
    jest.useFakeTimers();

    let attempts = 0;

    server.use(
      http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
        attempts++;
        return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 });
      })
    );

    const resultPromise = SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

    // Fast-forward through all retry delays
    await jest.runAllTimersAsync();

    const result = await resultPromise;

    // Should attempt 3 times (MAX_RETRIES)
    expect(attempts).toBe(3);
    expect(result.success).toBe(false);

    jest.useRealTimers();
  });

  it('succeeds on retry after initial failure', async () => {
    jest.useFakeTimers();

    let attempts = 0;

    server.use(
      http.post(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/*`, () => {
        attempts++;
        if (attempts < 2) {
          return HttpResponse.json({ error: 'Service unavailable' }, { status: 503 });
        }
        return HttpResponse.json({ Key: 'success-key' }, { status: 200 });
      })
    );

    const resultPromise = SupabaseStorageClient.uploadProfilePicture(mockUserId, mockFilePath);

    // Fast-forward through retry delay
    await jest.runAllTimersAsync();

    const result = await resultPromise;

    expect(attempts).toBe(2);
    expect(result.success).toBe(true);

    jest.useRealTimers();
  });
});

describe('SupabaseStorageClient - Token Refresh Interceptor', () => {
  /**
   * Token expiry detection logic tests.
   * Tests the logic used by the response interceptor to detect expired tokens.
   */

  // Helper function matching the interceptor logic
  const isTokenExpired = (
    status: number | undefined,
    errorData: { error_code?: string; msg?: string } | undefined
  ): boolean => {
    return (
      status === 401 ||
      (status === 403 &&
        (errorData?.error_code === 'bad_jwt' ||
          errorData?.msg?.includes('token is expired') === true))
    );
  };

  describe('token expiry detection', () => {
    it('should detect 401 status as token expired', () => {
      expect(isTokenExpired(401, {})).toBe(true);
    });

    it('should detect 401 with undefined data as token expired', () => {
      expect(isTokenExpired(401, undefined)).toBe(true);
    });

    it('should detect 403 with bad_jwt error_code as token expired', () => {
      expect(isTokenExpired(403, { error_code: 'bad_jwt' })).toBe(true);
    });

    it('should detect 403 with "token is expired" message as token expired', () => {
      expect(
        isTokenExpired(403, { msg: 'invalid JWT: token is expired', error_code: 'bad_jwt' })
      ).toBe(true);
    });

    it('should detect 403 with only "token is expired" in msg as token expired', () => {
      expect(isTokenExpired(403, { msg: 'token is expired' })).toBe(true);
    });

    it('should not detect 403 without bad_jwt or expired message as token expired', () => {
      expect(isTokenExpired(403, { error_code: 'permission_denied' })).toBe(false);
    });

    it('should not detect 403 with undefined error data as token expired', () => {
      expect(isTokenExpired(403, undefined)).toBe(false);
    });

    it('should not detect 500 as token expired', () => {
      expect(isTokenExpired(500, {})).toBe(false);
    });

    it('should not detect 200 as token expired', () => {
      expect(isTokenExpired(200, {})).toBe(false);
    });

    it('should not detect undefined status as token expired', () => {
      expect(isTokenExpired(undefined, {})).toBe(false);
    });
  });
});
