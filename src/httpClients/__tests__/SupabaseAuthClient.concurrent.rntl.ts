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

describe('SupabaseAuthClient - Concurrent 401 via response interceptor', () => {
  // These exercise the production race the auth client is built to handle:
  // N parallel authenticated requests, all 401, the interceptor coalesces
  // them into a single refresh, then retries each original request.

  const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

  // Reach into the singleton to share its axios instance with the test.
  // The instance carries the request + response interceptors we need to
  // exercise — the whole point of the test is to go through them, not
  // around them via refreshSession() directly.
  const getAxiosInstance = () =>
    (SupabaseAuthClient as unknown as { axiosInstance: import('axios').AxiosInstance })
      .axiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    // Drain any in-flight refresh promise from a previous test
    (SupabaseAuthClient as unknown as { refreshPromise: unknown }).refreshPromise = null;
  });

  it('coalesces N parallel 401s into a single refresh and resolves every caller', async () => {
    // Simulate the secure store: starts with an expired token, refresh
    // updates it via .set(). All reads see the current value.
    let storedAccessToken = 'expired_access_token';
    (SecureStore.get as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SecureStoreKey.ACCESS_TOKEN) return storedAccessToken;
      if (key === SecureStoreKey.REFRESH_TOKEN) return 'valid_refresh_token';
      return null;
    });
    (SecureStore.set as jest.Mock).mockImplementation(async (key: string, value: string) => {
      if (key === SecureStoreKey.ACCESS_TOKEN) {
        storedAccessToken = value;
      }
    });

    let refreshCallCount = 0;
    let protectedCallCount = 0;
    const seenAuthHeaders: string[] = [];

    server.use(
      // The protected endpoint we hit. First call with each Bearer token
      // returns 401 once if the token is the expired one, 200 otherwise.
      http.get(`${SUPABASE_URL}/protected`, ({ request }) => {
        protectedCallCount += 1;
        const auth = request.headers.get('authorization') ?? '';
        seenAuthHeaders.push(auth);
        if (auth === 'Bearer expired_access_token') {
          return HttpResponse.json(
            { error_code: 'bad_jwt', msg: 'token is expired' },
            { status: 401 }
          );
        }
        return HttpResponse.json({ ok: true, auth });
      }),
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        refreshCallCount += 1;
        return HttpResponse.json({
          access_token: 'fresh_access_token',
          refresh_token: 'fresh_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    const client = getAxiosInstance();

    // Fire 5 parallel requests through the actual interceptor stack
    const results = await Promise.all([
      client.get('/protected'),
      client.get('/protected'),
      client.get('/protected'),
      client.get('/protected'),
      client.get('/protected'),
    ]);

    // Every caller resolved
    expect(results).toHaveLength(5);
    results.forEach((r: { data: { ok: boolean } }) => {
      expect(r.data.ok).toBe(true);
    });

    // Exactly one refresh POST regardless of how many 401s fired
    expect(refreshCallCount).toBe(1);

    // Each original request was retried with the fresh token
    const retried = seenAuthHeaders.filter(h => h === 'Bearer fresh_access_token');
    expect(retried.length).toBe(5);

    // 5 initial 401s + 5 retries = 10 protected hits
    expect(protectedCallCount).toBe(10);
  });

  it('rejects every queued caller (no hangs) when refresh fails under load', async () => {
    // This is the FU-06 guarantee: a refresh failure must reject ALL
    // concurrent waiters, not just the first one. Before the single-flight
    // refactor, the refreshSubscribers queue could leave N-1 promises
    // hanging forever when refresh failed.

    (SecureStore.get as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SecureStoreKey.ACCESS_TOKEN) return 'expired_access_token';
      if (key === SecureStoreKey.REFRESH_TOKEN) return 'dead_refresh_token';
      return null;
    });

    let refreshCallCount = 0;
    server.use(
      http.get(`${SUPABASE_URL}/protected`, () =>
        HttpResponse.json({ error_code: 'bad_jwt', msg: 'token is expired' }, { status: 401 })
      ),
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        refreshCallCount += 1;
        return HttpResponse.json(
          { error: 'invalid_grant', error_description: 'Refresh token expired' },
          { status: 400 }
        );
      })
    );

    const client = getAxiosInstance();

    const settled = await Promise.allSettled([
      client.get('/protected'),
      client.get('/protected'),
      client.get('/protected'),
      client.get('/protected'),
      client.get('/protected'),
    ]);

    // None hang; all reject. (If FU-06 regressed, this would time out.)
    expect(settled).toHaveLength(5);
    settled.forEach(r => {
      expect(r.status).toBe('rejected');
    });

    // Single-flight: one refresh attempt despite 5 concurrent 401s
    expect(refreshCallCount).toBe(1);

    // Interceptor's catch path cleared local credentials
    expect(SecureStore.clear).toHaveBeenCalled();
  });

  it('does not recurse when the refresh endpoint itself returns 401', async () => {
    // The refresh POST goes through the same axios instance, so its
    // response hits the same interceptor. Without the URL guard, a 401
    // from /auth/v1/token would trigger another refresh — infinite loop.
    (SecureStore.get as jest.Mock).mockImplementation(async (key: string) => {
      if (key === SecureStoreKey.REFRESH_TOKEN) return 'dead_refresh_token';
      return null;
    });

    let refreshCallCount = 0;
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        refreshCallCount += 1;
        return HttpResponse.json({ msg: 'invalid refresh token' }, { status: 401 });
      })
    );

    await expect(SupabaseAuthClient.refreshSession()).rejects.toThrow();

    // Exactly one POST: the interceptor must not retry the refresh URL
    expect(refreshCallCount).toBe(1);
    // Direct refreshSession() failures must NOT clear storage
    expect(SecureStore.clear).not.toHaveBeenCalled();
  });

  it('shares the in-flight refresh promise across direct callers', async () => {
    // FU-07 guarantee for direct callers (storage client interceptor calls
    // SupabaseAuthClient.refreshSession() directly, no auth interceptor in
    // its path).
    (SecureStore.get as jest.Mock).mockResolvedValue('valid_refresh_token');

    let refreshCallCount = 0;
    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        refreshCallCount += 1;
        return HttpResponse.json({
          access_token: `new_access_${refreshCallCount}`,
          refresh_token: `new_refresh_${refreshCallCount}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    const results = await Promise.all([
      SupabaseAuthClient.refreshSession(),
      SupabaseAuthClient.refreshSession(),
      SupabaseAuthClient.refreshSession(),
      SupabaseAuthClient.refreshSession(),
      SupabaseAuthClient.refreshSession(),
    ]);

    // All five callers got the SAME response object (same in-flight promise)
    expect(refreshCallCount).toBe(1);
    results.forEach(r => {
      expect(r.access_token).toBe('new_access_1');
    });
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
