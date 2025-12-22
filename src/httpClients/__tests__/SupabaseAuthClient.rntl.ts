/**
 * Core Tests for SupabaseAuthClient
 *
 * Uses MSW (Mock Service Worker) to intercept HTTP requests.
 * Tests E2E mocking and real authentication flows.
 *
 * Related test files:
 * - AuthError.rntl.ts - AuthError class tests
 * - SupabaseAuthClient.security.rntl.ts - Security-focused tests
 * - SupabaseAuthClient.concurrent.rntl.ts - Concurrent operation tests
 */

import { http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';

import { AuthError, SupabaseAuthClient } from '../SupabaseAuthClient';

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

// Mock user data for responses
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

const mockSignInResponse = {
  access_token: 'access_token_123',
  refresh_token: 'refresh_token_123',
  token_type: 'bearer',
  expires_in: 3600,
  user: mockUser,
};

describe('SupabaseAuthClient - signUp', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { EncryptedStore, EncryptedStoreKey } = require('@app/utils/storage/EncryptedStore');
  const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns mock user without network call', async () => {
      const result = await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.session).toBeNull();
    });

    it('stores user data in storage', async () => {
      await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_EMAIL,
        'test@example.com'
      );
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.USER_ID, expect.any(String));
    });
  });

  describe('Real API Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    });

    it('makes signup request and returns user', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({
            ...mockUser,
            email_confirmed_at: null,
          });
        })
      );

      const result = await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.user?.email).toBe('test@example.com');
      expect(result.session).toBeNull();
    });

    it('throws AuthError for existing user (422)', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json(
            { error_code: 'user_already_exists', msg: 'User already registered' },
            { status: 422 }
          );
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'existing@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(AuthError);
    });

    it('returns error code for existing user', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json(
            { error_code: 'user_already_exists', msg: 'User already registered' },
            { status: 422 }
          );
        })
      );

      try {
        await SupabaseAuthClient.signUp({
          email: 'existing@example.com',
          password: 'Password123!',
        });
      } catch (error) {
        expect((error as AuthError).code).toBe('user_already_exists');
      }
    });
  });
});

describe('SupabaseAuthClient - signIn', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns mock session without network call', async () => {
      const result = await SupabaseAuthClient.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('stores tokens in SecureStore', async () => {
      await SupabaseAuthClient.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, expect.any(String));
      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.REFRESH_TOKEN,
        expect.any(String)
      );
    });
  });

  describe('Real API Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    });

    it('makes login request and stores tokens', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(mockSignInResponse);
        })
      );

      const result = await SupabaseAuthClient.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.access_token).toBe('access_token_123');
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'access_token_123');
      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.REFRESH_TOKEN,
        'refresh_token_123'
      );
    });

    it('throws AuthError for invalid credentials', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'invalid_credentials', msg: 'Invalid login credentials' },
            { status: 400 }
          );
        })
      );

      await expect(
        SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'wrong_password',
        })
      ).rejects.toMatchObject({
        code: 'invalid_credentials',
      });
    });

    it('throws AuthError for unconfirmed email', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_code: 'email_not_confirmed', msg: 'Email not confirmed' },
            { status: 400 }
          );
        })
      );

      await expect(
        SupabaseAuthClient.signIn({
          email: 'unconfirmed@example.com',
          password: 'Password123!',
        })
      ).rejects.toMatchObject({
        code: 'email_not_confirmed',
      });
    });

    it('throws AuthError for rate limit exceeded (429)', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          // Return empty body so handleError uses status code mapping
          return HttpResponse.json({}, { status: 429 });
        })
      );

      await expect(
        SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toMatchObject({
        code: 'rate_limit_exceeded',
      });
    });
  });
});

describe('SupabaseAuthClient - refreshSession', () => {
  const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  it('throws error when no refresh token available', async () => {
    (SecureStore.get as jest.Mock).mockResolvedValue(null);

    await expect(SupabaseAuthClient.refreshSession()).rejects.toThrow('No refresh token available');
  });

  it('stores new tokens on successful refresh', async () => {
    (SecureStore.get as jest.Mock).mockResolvedValue('old_refresh_token');

    server.use(
      http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
        return HttpResponse.json({
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        });
      })
    );

    await SupabaseAuthClient.refreshSession();

    expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'new_access_token');
    expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.REFRESH_TOKEN, 'new_refresh_token');
  });
});

describe('SupabaseAuthClient - logout', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { EncryptedStore } = require('@app/utils/storage/EncryptedStore');
  const { SecureStore } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('clears session without network call', async () => {
      await SupabaseAuthClient.logout();

      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });
  });

  describe('Real API Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');
    });

    it('makes logout request and clears session', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await SupabaseAuthClient.logout();

      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });

    it('clears session even if logout API fails', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.error();
        })
      );

      await SupabaseAuthClient.logout();

      // Should still clear local storage
      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });
  });
});

describe('SupabaseAuthClient - getCurrentUser', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { EncryptedStore } = require('@app/utils/storage/EncryptedStore');
  const { SecureStore } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns null when no access token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue(null);

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toBeNull();
    });

    it('returns mock user from stored data', async () => {
      (SecureStore.get as jest.Mock)
        .mockResolvedValueOnce('mock_access_token')
        .mockResolvedValueOnce('user-id-123');
      (EncryptedStore.get as jest.Mock)
        .mockResolvedValueOnce('test@example.com')
        .mockResolvedValueOnce('Test')
        .mockResolvedValueOnce('User');

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result?.email).toBe('test@example.com');
      expect(result?.id).toBe('user-id-123');
    });
  });

  describe('Real API Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    });

    it('returns null when no access token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue(null);

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toBeNull();
    });

    it('fetches user from API', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(mockUser);
        })
      );

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result?.email).toBe('test@example.com');
    });

    it('returns null on API error', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
        })
      );

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});

describe('SupabaseAuthClient - changePassword', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');
  const { EncryptedStore } = require('@app/utils/storage/EncryptedStore');
  const { SecureStore } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns success without network call', async () => {
      await expect(
        SupabaseAuthClient.changePassword('oldPassword', 'newPassword')
      ).resolves.not.toThrow();
    });
  });

  describe('Real API Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
      (EncryptedStore.get as jest.Mock).mockResolvedValue('test@example.com');
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');
    });

    it('verifies current password then updates', async () => {
      let signInCalled = false;
      let updateCalled = false;

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          signInCalled = true;
          return HttpResponse.json(mockSignInResponse);
        }),
        http.put(`${SUPABASE_URL}/auth/v1/user`, () => {
          updateCalled = true;
          return HttpResponse.json(mockUser);
        })
      );

      await SupabaseAuthClient.changePassword('currentPassword', 'newPassword');

      expect(signInCalled).toBe(true);
      expect(updateCalled).toBe(true);
    });

    it('throws user-friendly error for incorrect current password', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        })
      );

      await expect(
        SupabaseAuthClient.changePassword('wrongPassword', 'newPassword')
      ).rejects.toThrow('Current password is incorrect');
    });

    it('throws error when email not found', async () => {
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      await expect(
        SupabaseAuthClient.changePassword('currentPassword', 'newPassword')
      ).rejects.toThrow('User email not found');
    });
  });
});

describe('SupabaseAuthClient - requestPasswordRecovery', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('E2E Mock Mode', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(true);
    });

    it('returns success without network call', async () => {
      await expect(
        SupabaseAuthClient.requestPasswordRecovery('test@example.com')
      ).resolves.not.toThrow();
    });
  });

  describe('Real API Flow', () => {
    beforeEach(() => {
      (isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    });

    it('makes recovery request', async () => {
      let recoverCalled = false;

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/recover`, () => {
          recoverCalled = true;
          return HttpResponse.json({});
        })
      );

      await SupabaseAuthClient.requestPasswordRecovery('test@example.com');

      expect(recoverCalled).toBe(true);
    });
  });
});

describe('SupabaseAuthClient - isAuthenticated', () => {
  const { SecureStore } = require('@app/utils/storage/SecureStore');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when both tokens exist', async () => {
    (SecureStore.get as jest.Mock)
      .mockResolvedValueOnce('access_token')
      .mockResolvedValueOnce('refresh_token');

    const result = await SupabaseAuthClient.isAuthenticated();

    expect(result).toBe(true);
  });

  it('returns false when access token missing', async () => {
    (SecureStore.get as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('refresh_token');

    const result = await SupabaseAuthClient.isAuthenticated();

    expect(result).toBe(false);
  });

  it('returns false when refresh token missing', async () => {
    (SecureStore.get as jest.Mock)
      .mockResolvedValueOnce('access_token')
      .mockResolvedValueOnce(null);

    const result = await SupabaseAuthClient.isAuthenticated();

    expect(result).toBe(false);
  });
});

describe('SupabaseAuthClient - verifyMockStatus', () => {
  const { isE2EMockEnabled } = require('@app/config/e2e');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  it('returns mocked: true when E2E mock enabled', async () => {
    (isE2EMockEnabled as jest.Mock).mockReturnValue(true);

    const result = await SupabaseAuthClient.verifyMockStatus();

    expect(result.mocked).toBe(true);
  });

  it('returns mocked: false when hitting real API', async () => {
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/health`, () => {
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const result = await SupabaseAuthClient.verifyMockStatus();

    expect(result.mocked).toBe(false);
  });

  it('returns mocked: false even on API error', async () => {
    (isE2EMockEnabled as jest.Mock).mockReturnValue(false);

    server.use(
      http.get(`${SUPABASE_URL}/auth/v1/health`, () => {
        return HttpResponse.error();
      })
    );

    const result = await SupabaseAuthClient.verifyMockStatus();

    expect(result.mocked).toBe(false);
  });
});
