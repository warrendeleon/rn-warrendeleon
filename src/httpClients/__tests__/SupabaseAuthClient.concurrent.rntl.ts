/**
 * Concurrent Operation Tests for SupabaseAuthClient
 *
 * Tests concurrent and sequential token refresh operations,
 * race conditions, and state consistency under concurrent access.
 */

import { http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';

import { SupabaseAuthClient } from '../SupabaseAuthClient';

// Mock dependencies
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
}));

jest.mock('@app/utils/storage/EncryptedStore', () => ({
  EncryptedStore: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  EncryptedStoreKey: {
    USER_EMAIL: 'userEmail',
    USER_FIRST_NAME: 'userFirstName',
    USER_LAST_NAME: 'userLastName',
    USER_PHONE_NUMBER: 'userPhoneNumber',
  },
}));

jest.mock('@app/utils/storage/SecureStore', () => ({
  SecureStore: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
  SecureStoreKey: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
  },
}));

const SUPABASE_URL = 'https://test.supabase.co';

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  aud: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2025-01-01T00:00:00Z',
  phone: null,
  confirmed_at: '2025-01-01T00:00:00Z',
  last_sign_in_at: '2025-01-01T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
};

describe('SupabaseAuthClient - Security: Concurrent Token Refresh', () => {
  const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  it('handles concurrent refresh requests without data loss', async () => {
    // Simulate having a valid refresh token
    (SecureStore.get as jest.Mock).mockResolvedValue('initial_refresh_token');

    let refreshCallCount = 0;
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        refreshCallCount++;
        return HttpResponse.json({
          access_token: `new_access_token_${refreshCallCount}`,
          refresh_token: `new_refresh_token_${refreshCallCount}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    // Fire multiple concurrent refresh requests
    const refreshPromises = [
      SupabaseAuthClient.refreshSession(),
      SupabaseAuthClient.refreshSession(),
      SupabaseAuthClient.refreshSession(),
    ];

    // All should resolve without errors
    const results = await Promise.all(refreshPromises);

    // Each refresh should succeed
    results.forEach(result => {
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    // Tokens should be stored (at least once)
    expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, expect.any(String));
    expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.REFRESH_TOKEN, expect.any(String));
  });

  it('handles sequential refresh then logout without errors', async () => {
    const { EncryptedStore } = require('@app/utils/storage/EncryptedStore');
    const { isE2EMockEnabled } = require('@app/config/e2e');

    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (SecureStore.get as jest.Mock).mockResolvedValue('mock_token');

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json({
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      }),
      http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
        return HttpResponse.json({}, { status: 204 });
      })
    );

    // Refresh then immediately logout
    await SupabaseAuthClient.refreshSession();
    await SupabaseAuthClient.logout();

    // Storage should be cleared by logout
    expect(SecureStore.clear).toHaveBeenCalled();
    expect(EncryptedStore.clear).toHaveBeenCalled();
  });

  it('handles refresh failure gracefully without corrupting state', async () => {
    (SecureStore.get as jest.Mock).mockResolvedValue('old_refresh_token');

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json(
          { error: 'refresh_token_not_found', msg: 'Refresh token not found' },
          { status: 400 }
        );
      })
    );

    await expect(SupabaseAuthClient.refreshSession()).rejects.toThrow();

    // Failed refresh should NOT clear existing tokens
    // (only successful logout or explicit clear should do that)
    expect(SecureStore.clear).not.toHaveBeenCalled();
  });
});

describe('Concurrent request security', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
  });

  it('should handle sequential refresh requests without issues', async () => {
    const { SecureStore } = require('@app/utils/storage/SecureStore');
    let refreshCount = 0;

    (SecureStore.get as jest.Mock).mockResolvedValue('old_refresh_token');
    (SecureStore.set as jest.Mock).mockResolvedValue(true);

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        refreshCount++;
        return HttpResponse.json({
          access_token: `new_access_${refreshCount}`,
          refresh_token: `new_refresh_${refreshCount}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    // First refresh
    const result1 = await SupabaseAuthClient.refreshSession();
    expect(result1.access_token).toBe('new_access_1');

    // Second refresh (sequential, not concurrent)
    const result2 = await SupabaseAuthClient.refreshSession();
    expect(result2.access_token).toBe('new_access_2');

    // Both requests should succeed independently
    expect(refreshCount).toBe(2);
  });

  it('should store new tokens after successful refresh', async () => {
    const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

    (SecureStore.get as jest.Mock).mockResolvedValue('old_refresh_token');
    (SecureStore.set as jest.Mock).mockResolvedValue(true);

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json({
          access_token: 'refreshed_access_token',
          refresh_token: 'refreshed_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    await SupabaseAuthClient.refreshSession();

    // Verify new tokens are stored
    expect(SecureStore.set).toHaveBeenCalledWith(
      SecureStoreKey.ACCESS_TOKEN,
      'refreshed_access_token'
    );
    expect(SecureStore.set).toHaveBeenCalledWith(
      SecureStoreKey.REFRESH_TOKEN,
      'refreshed_refresh_token'
    );
  });
});

describe('SupabaseAuthClient - Token Refresh Interceptor', () => {
  /**
   * Token expiry detection logic tests.
   * Tests the logic used by the response interceptor to detect expired tokens.
   */

  // Helper function matching the interceptor logic
  const isTokenExpired = (
    status: number | undefined,
    errorData: { error_code?: string; msg?: string; message?: string } | undefined
  ): boolean => {
    const errorMessage = errorData?.msg || errorData?.message || '';
    return (
      status === 401 ||
      (status === 403 &&
        (errorData?.error_code === 'bad_jwt' ||
          errorMessage.includes('token is expired') ||
          errorMessage.includes('exp')))
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

    it('should detect 403 with "exp" in message as token expired', () => {
      expect(isTokenExpired(403, { message: 'JWT exp claim is invalid' })).toBe(true);
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
