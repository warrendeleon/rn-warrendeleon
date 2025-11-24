import { http, HttpResponse } from 'msw';

import { server } from '@app/test-utils/msw/server';
import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

import { SupabaseAuthClient } from '../api';

// Mock storage modules
jest.mock('@app/utils/storage/SecureStore');
jest.mock('@app/utils/storage/EncryptedStore');

const SUPABASE_URL = 'https://test.supabase.co';

describe('SupabaseAuthClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a new user and store session', async () => {
      (SecureStore.set as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const result = await SupabaseAuthClient.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'access_token_123');
      expect(SecureStore.set).toHaveBeenCalledWith(
        SecureStoreKey.REFRESH_TOKEN,
        'refresh_token_123'
      );
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_EMAIL,
        'test@example.com'
      );
    });

    it('should handle 422 email already registered error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json(
            { error_description: 'Email already registered' },
            { status: 422 }
          );
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should handle 400 invalid email or password error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({}, { status: 400 });
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'invalid',
          password: 'short',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should handle 429 rate limit error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({}, { status: 429 });
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Too many attempts. Please try again later.');
    });

    it('should handle 500 server error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({}, { status: 500 });
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Server error. Please try again later.');
    });
  });

  describe('signIn', () => {
    it('should sign in and store session', async () => {
      (SecureStore.set as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const result = await SupabaseAuthClient.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.access_token).toBe('access_token_123');
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'access_token_123');
    });

    it('should handle invalid credentials error', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json({ error_description: 'Invalid credentials' }, { status: 400 });
        })
      );

      await expect(
        SupabaseAuthClient.signIn({
          email: 'test@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshSession', () => {
    it('should refresh session with valid refresh token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce('old_refresh_token');
      (SecureStore.set as jest.Mock).mockResolvedValue(true);

      const result = await SupabaseAuthClient.refreshSession();

      expect(result.access_token).toBe('access_token_123');
      expect(SecureStore.set).toHaveBeenCalledWith(SecureStoreKey.ACCESS_TOKEN, 'access_token_123');
    });

    it('should throw error if no refresh token available', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(SupabaseAuthClient.refreshSession()).rejects.toThrow(
        'No refresh token available'
      );
    });

    it('should handle invalid refresh token error', async () => {
      // Mock multiple calls to SecureStore.get (interceptor + refreshSession method + interceptor retry)
      (SecureStore.get as jest.Mock).mockResolvedValue('invalid_token'); // Return token for all calls

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
          return HttpResponse.json(
            { error_description: 'Invalid refresh token' },
            { status: 400 } // Use 400 instead of 401 to avoid interceptor retry loop
          );
        })
      );

      await expect(SupabaseAuthClient.refreshSession()).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should logout and clear session', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce('access_token_123');
      (SecureStore.clear as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.clear as jest.Mock).mockResolvedValue(true);

      await SupabaseAuthClient.logout();

      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });

    it('should clear session even if API call fails', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce('access_token_123');
      (SecureStore.clear as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.clear as jest.Mock).mockResolvedValue(true);

      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
          return HttpResponse.error();
        })
      );

      await SupabaseAuthClient.logout();

      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });

    it('should clear session if no access token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce(null);
      (SecureStore.clear as jest.Mock).mockResolvedValue(true);
      (EncryptedStore.clear as jest.Mock).mockResolvedValue(true);

      await SupabaseAuthClient.logout();

      expect(SecureStore.clear).toHaveBeenCalled();
      expect(EncryptedStore.clear).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user with valid token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce('access_token_123');

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toEqual(
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
        })
      );
    });

    it('should return null if no access token', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null if API call fails', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce('access_token_123');

      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.error();
        })
      );

      const result = await SupabaseAuthClient.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if both tokens exist', async () => {
      (SecureStore.get as jest.Mock)
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce('refresh_token_123');

      const result = await SupabaseAuthClient.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if access token missing', async () => {
      (SecureStore.get as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('refresh_token_123');

      const result = await SupabaseAuthClient.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false if refresh token missing', async () => {
      (SecureStore.get as jest.Mock)
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce(null);

      const result = await SupabaseAuthClient.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false if both tokens missing', async () => {
      (SecureStore.get as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      const result = await SupabaseAuthClient.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with message field', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({ message: 'Custom error message' }, { status: 400 });
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Custom error message');
    });

    it('should handle unexpected status codes', async () => {
      server.use(
        http.post(`${SUPABASE_URL}/auth/v1/signup`, () => {
          return HttpResponse.json({}, { status: 503 });
        })
      );

      await expect(
        SupabaseAuthClient.signUp({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('An unexpected error occurred');
    });
  });
});
