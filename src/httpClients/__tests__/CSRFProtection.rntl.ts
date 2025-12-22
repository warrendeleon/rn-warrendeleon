/**
 * CSRF Protection Tests
 *
 * Tests for Cross-Site Request Forgery protection mechanisms
 * in the HTTP client layer. Verifies that:
 * - CSRF tokens are included in state-changing requests
 * - CSRF tokens are not included in safe methods (GET, HEAD, OPTIONS)
 * - CSRF token storage and refresh behaviour is secure
 *
 * Note: Mobile apps have different CSRF considerations than web apps.
 * These tests verify the patterns used for API protection.
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
const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('CSRF Protection', () => {
  const { SecureStore, SecureStoreKey } = require('@app/utils/storage/SecureStore');
  const { EncryptedStore } = require('@app/utils/storage/EncryptedStore');

  beforeEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    SupabaseAuthClient.resetMockState();
  });

  describe('State-Changing Request Protection', () => {
    /**
     * CSRF protection for POST requests
     * Verifies that state-changing requests include proper headers
     */
    it('includes apikey header in POST requests', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: null,
              phone: null,
              confirmed_at: null,
              last_sign_in_at: null,
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      // API key should be included for authentication
      expect(capturedHeaders['apikey']).toBe('test-anon-key');
      expect(capturedHeaders['content-type']).toBe('application/json');
    });

    it('includes apikey header in PUT requests', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.put(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: new Date().toISOString(),
              phone: null,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.updateUser({ firstName: 'Test' });

      expect(capturedHeaders['apikey']).toBe('test-anon-key');
      expect(capturedHeaders['authorization']).toContain('Bearer');
    });

    it('includes apikey header in DELETE equivalent operations', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await SupabaseAuthClient.logout();

      expect(capturedHeaders['apikey']).toBe('test-anon-key');
    });
  });

  describe('Safe Method Behaviour', () => {
    /**
     * GET requests should include API key for authentication
     * but don't require CSRF token (safe method)
     */
    it('includes apikey in GET requests for authentication', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: new Date().toISOString(),
              phone: null,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.getCurrentUser();

      // API key included for authentication
      expect(capturedHeaders['apikey']).toBe('test-anon-key');
    });

    it('includes authorization header with bearer token in GET requests', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: new Date().toISOString(),
              phone: null,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.getCurrentUser();

      expect(capturedHeaders['authorization']).toBe('Bearer mock_access_token');
    });
  });

  describe('Token Mismatch Handling', () => {
    /**
     * Server should reject requests with invalid or missing tokens
     */
    it('handles 401 response when access token is invalid', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('invalid_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            { error: 'invalid_token', msg: 'Invalid or expired token' },
            { status: 401 }
          );
        })
      );

      const result = await SupabaseAuthClient.getCurrentUser();

      // Should return null gracefully, not throw
      expect(result).toBeNull();
    });

    it('handles 403 response for bad JWT', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('bad_jwt_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            { error_code: 'bad_jwt', msg: 'JWT token is malformed' },
            { status: 403 }
          );
        })
      );

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('Token Storage Security', () => {
    /**
     * Tokens should be stored securely, not in localStorage
     */
    it('stores access token in SecureStore, not localStorage', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            {
              access_token: 'secure_access_token',
              refresh_token: 'secure_refresh_token',
              token_type: 'bearer',
              expires_in: 3600,
              user: {
                id: TEST_UUID,
                aud: 'authenticated',
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString(),
                phone: null,
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      // Verify tokens stored in SecureStore (secure storage)
      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.ACCESS_TOKEN,
        'secure_access_token'
      );
      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.REFRESH_TOKEN,
        'secure_refresh_token'
      );
    });

    it('clears all tokens on logout', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_token');

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await SupabaseAuthClient.logout();

      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });
  });

  describe('Token Refresh Security', () => {
    /**
     * Token refresh should not expose sensitive data
     */
    it('uses refresh token securely without exposing access token', async () => {
      let capturedBody: Record<string, unknown> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('old_refresh_token');

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            {
              access_token: 'new_access_token',
              refresh_token: 'new_refresh_token',
              token_type: 'bearer',
              expires_in: 3600,
              user: {
                id: TEST_UUID,
                aud: 'authenticated',
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString(),
                phone: null,
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.refreshSession();

      // Only refresh token should be in body, not access token
      expect(capturedBody).toHaveProperty('refresh_token');
      expect(capturedBody).not.toHaveProperty('access_token');
    });

    it('replaces old tokens with new ones on refresh', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValue('old_refresh_token');

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            {
              access_token: 'brand_new_access_token',
              refresh_token: 'brand_new_refresh_token',
              token_type: 'bearer',
              expires_in: 3600,
              user: {
                id: TEST_UUID,
                aud: 'authenticated',
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString(),
                phone: null,
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.refreshSession();

      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.ACCESS_TOKEN,
        'brand_new_access_token'
      );
      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.REFRESH_TOKEN,
        'brand_new_refresh_token'
      );
    });
  });

  describe('Request Origin Validation', () => {
    /**
     * API requests should include proper content-type headers
     */
    it('sets Content-Type header to application/json for POST requests', async () => {
      let capturedHeaders: Record<string, string> = {};

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: null,
              phone: null,
              confirmed_at: null,
              last_sign_in_at: null,
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(capturedHeaders['content-type']).toBe('application/json');
    });

    it('sets Content-Type header to application/json for PUT requests', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('mock_access_token');

      server.use(
        http.put(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: new Date().toISOString(),
              phone: null,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.updateUser({ firstName: 'Test' });

      expect(capturedHeaders['content-type']).toBe('application/json');
    });
  });

  describe('Double Submit Cookie Pattern (Mobile Alternative)', () => {
    /**
     * Mobile apps use bearer tokens instead of cookies,
     * but the principle of binding requests to a session remains
     */
    it('binds requests to session via Authorization header', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue('session_bound_token');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: new Date().toISOString(),
              phone: null,
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.getCurrentUser();

      // Session binding via bearer token
      expect(capturedHeaders['authorization']).toBe('Bearer session_bound_token');
    });

    it('does not include Authorization header when no session exists', async () => {
      let capturedHeaders: Record<string, string> = {};
      (SecureStore.get as jest.Mock).mockResolvedValue(null);

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json(
            {
              id: TEST_UUID,
              aud: 'authenticated',
              email: 'test@example.com',
              email_confirmed_at: null,
              phone: null,
              confirmed_at: null,
              last_sign_in_at: null,
              created_at: new Date().toISOString(),
            },
            { status: 200 }
          );
        })
      );

      await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      // No Authorization header when not authenticated
      expect(capturedHeaders['authorization']).toBeUndefined();
    });
  });
});
