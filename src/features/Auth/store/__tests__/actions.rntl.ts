import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

import { SupabaseAuthClient } from '../../api/api';
import { checkSession, login, logout, register } from '../actions';

jest.mock('../../api/api');
jest.mock('@app/utils/storage/SecureStore');
jest.mock('@app/utils/storage/EncryptedStore');

describe('Auth actions', () => {
  const mockDispatch = jest.fn();
  const mockGetState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('dispatches fulfilled on success', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: {
          access_token: 'token',
          refresh_token: 'refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        },
      });

      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/register/fulfilled');
      expect(SupabaseAuthClient.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        data: {
          first_name: 'Warren',
          last_name: 'de Leon',
        },
      });

      expect(EncryptedStore.set).toHaveBeenCalledWith(EncryptedStoreKey.USER_FIRST_NAME, 'Warren');
      expect(EncryptedStore.set).toHaveBeenCalledWith(EncryptedStoreKey.USER_LAST_NAME, 'de Leon');
      expect(EncryptedStore.set).toHaveBeenCalledWith(EncryptedStoreKey.AUTH_PROVIDER, 'email');
    });

    it('dispatches rejected on failure', async () => {
      (SupabaseAuthClient.signUp as jest.Mock).mockRejectedValue(
        new Error('Email already registered')
      );

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/register/rejected');
      expect(result.payload).toBe('Email already registered');
    });

    it('rejects when signUp returns no user', async () => {
      (SupabaseAuthClient.signUp as jest.Mock).mockResolvedValue({
        user: null,
        session: null,
      });

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/register/rejected');
      expect(result.payload).toBe('Registration failed');
    });

    it('handles non-Error rejections', async () => {
      (SupabaseAuthClient.signUp as jest.Mock).mockRejectedValue('Network failure');

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/register/rejected');
      expect(result.payload).toBe('Registration failed');
    });
  });

  describe('login', () => {
    it('dispatches fulfilled on success', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'Warren',
          last_name: 'de Leon',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signIn as jest.Mock).mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'bearer',
        expires_in: 3600,
        user: mockUser,
      });

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('Warren');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('de Leon');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve('email');
          default:
            return Promise.resolve(null);
        }
      });

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/fulfilled');
      expect(SupabaseAuthClient.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('falls back to user_metadata when storage is empty', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'John',
          last_name: 'Doe',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signIn as jest.Mock).mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'bearer',
        expires_in: 3600,
        user: mockUser,
      });

      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/fulfilled');
      expect(result.payload).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        authProvider: 'email',
      });
    });

    it('handles non-string user_metadata values', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 123,
          last_name: null,
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signIn as jest.Mock).mockResolvedValue({
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'bearer',
        expires_in: 3600,
        user: mockUser,
      });

      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/fulfilled');
      expect(result.payload).toMatchObject({
        firstName: null,
        lastName: null,
      });
    });

    it('dispatches rejected on failure', async () => {
      (SupabaseAuthClient.signIn as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const thunk = login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/rejected');
      expect(result.payload).toBe('Invalid credentials');
    });

    it('handles non-Error rejections', async () => {
      (SupabaseAuthClient.signIn as jest.Mock).mockRejectedValue('Network failure');

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/rejected');
      expect(result.payload).toBe('Login failed');
    });
  });

  describe('checkSession', () => {
    it('dispatches fulfilled with user data when authenticated', async () => {
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockResolvedValue(true);

      (SecureStore.get as jest.Mock).mockImplementation((key: SecureStoreKey) => {
        switch (key) {
          case SecureStoreKey.USER_ID:
            return Promise.resolve('user-123');
          case SecureStoreKey.BIOMETRIC_PREFERENCE:
            return Promise.resolve('enabled');
          default:
            return Promise.resolve(null);
        }
      });

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_EMAIL:
            return Promise.resolve('test@example.com');
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('Warren');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('de Leon');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve('email');
          default:
            return Promise.resolve(null);
        }
      });

      const thunk = checkSession();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/checkSession/fulfilled');
      expect(result.payload).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Warren',
        lastName: 'de Leon',
        profilePicture: null,
        authProvider: 'email',
        biometricEnabled: true,
      });
    });

    it('dispatches fulfilled with null when not authenticated', async () => {
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockResolvedValue(false);

      const thunk = checkSession();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/checkSession/fulfilled');
      expect(result.payload).toBeNull();
    });

    it('handles non-enabled biometric preference', async () => {
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockResolvedValue(true);

      (SecureStore.get as jest.Mock).mockImplementation((key: SecureStoreKey) => {
        switch (key) {
          case SecureStoreKey.USER_ID:
            return Promise.resolve('user-123');
          case SecureStoreKey.BIOMETRIC_PREFERENCE:
            return Promise.resolve('disabled');
          default:
            return Promise.resolve(null);
        }
      });

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_EMAIL:
            return Promise.resolve('test@example.com');
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('Warren');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('de Leon');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve(null);
          default:
            return Promise.resolve(null);
        }
      });

      const thunk = checkSession();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/checkSession/fulfilled');
      expect(result.payload).toMatchObject({
        biometricEnabled: false,
        authProvider: null,
      });
    });

    it('dispatches rejected on error', async () => {
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockRejectedValue(
        new Error('Session check failed')
      );

      const thunk = checkSession();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/checkSession/rejected');
    });
  });

  describe('logout', () => {
    it('dispatches fulfilled on success', async () => {
      (SupabaseAuthClient.logout as jest.Mock).mockResolvedValue(undefined);

      const thunk = logout();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(SupabaseAuthClient.logout).toHaveBeenCalled();
      expect(result.type).toBe('auth/logout/fulfilled');
    });

    it('dispatches rejected on failure', async () => {
      (SupabaseAuthClient.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const thunk = logout();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/logout/rejected');
      expect(result.payload).toBe('Network error');
    });

    it('handles non-Error rejections', async () => {
      (SupabaseAuthClient.logout as jest.Mock).mockRejectedValue('Network failure');

      const thunk = logout();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/logout/rejected');
      expect(result.payload).toBe('Logout failed');
    });
  });
});
