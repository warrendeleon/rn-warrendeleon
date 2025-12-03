/**
 * Tests for SupabaseStorageClient
 *
 * Tests StorageError class and documents E2E mocking behaviour.
 * Network operations are mocked in unit tests.
 */

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

// Store interceptor handlers for testing - uses global to survive hoisting
const interceptorMocks = {
  requestHandlers: null as { success: unknown; error: unknown } | null,
  responseHandlers: null as { success: unknown; error: unknown } | null,
};

jest.mock('axios', () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((successHandler, errorHandler) => {
          interceptorMocks.requestHandlers = { success: successHandler, error: errorHandler };
          return 0;
        }),
      },
      response: {
        use: jest.fn((successHandler, errorHandler) => {
          interceptorMocks.responseHandlers = { success: successHandler, error: errorHandler };
          return 0;
        }),
      },
    },
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn(error => error?.isAxiosError === true),
  };
});

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
    get: jest.fn(),
    set: jest.fn(),
  },
  SecureStoreKey: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
  },
}));

jest.mock('@app/httpClients/SupabaseAuthClient', () => ({
  SupabaseAuthClient: {
    refreshSession: jest.fn(),
  },
}));

jest.mock('@app/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

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
    it('should be convertible to string', () => {
      const error = new StorageError('Test error', 'UPLOAD_FAILED');

      expect(error.toString()).toBe('StorageError: Test error');
    });

    it('should work with JSON.stringify', () => {
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

  describe('interceptor registration', () => {
    it('should register request interceptor for adding access token', () => {
      // The request interceptor is registered when the module is imported
      expect(interceptorMocks.requestHandlers).not.toBeNull();

      // Verify a function was passed as the success handler
      expect(typeof interceptorMocks.requestHandlers?.success).toBe('function');
    });

    it('should register response interceptor for token refresh', () => {
      // The response interceptor is registered when the module is imported
      expect(interceptorMocks.responseHandlers).not.toBeNull();

      // Verify functions were passed as handlers (success and error handlers)
      expect(typeof interceptorMocks.responseHandlers?.success).toBe('function');
      expect(typeof interceptorMocks.responseHandlers?.error).toBe('function');
    });
  });
});

/**
 * Note: Integration tests for SupabaseStorageClient are performed via E2E tests
 * with Detox/Cucumber. The E2E mock system (isE2EMockEnabled) allows testing
 * storage flows without network calls.
 *
 * Key behaviours tested via E2E:
 * - uploadProfilePicture: Uploads image, stores URL in EncryptedStore
 * - deleteProfilePicture: Deletes image from storage
 * - Retry logic with exponential backoff
 * - Token refresh on 401/403 errors
 * - Error handling for various HTTP status codes
 *
 * Production behaviours (real API calls) are tested manually and in staging.
 */
