import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

import {
  checkSession,
  login,
  logout,
  refreshUser,
  register,
  updateUserProfileAsync,
} from '../actions';

// Import the actual AuthError class to use in tests
const { AuthError } = jest.requireActual('@app/httpClients');

jest.mock('@app/httpClients', () => ({
  ...jest.requireActual('@app/httpClients'),
  SupabaseAuthClient: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    updateUser: jest.fn(),
  },
}));
jest.mock('@app/utils/storage/SecureStore');
jest.mock('@app/utils/storage/EncryptedStore');

// Import the mocked SupabaseAuthClient for test assertions
const { SupabaseAuthClient } = jest.requireMock('@app/httpClients');

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
      expect(result.payload).toEqual({ message: 'Email already registered', code: undefined });
    });

    it('dispatches rejected with error code when AuthError is thrown', async () => {
      (SupabaseAuthClient.signUp as jest.Mock).mockRejectedValue(
        new AuthError('User already registered', 'user_already_exists')
      );

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/register/rejected');
      expect(result.payload).toEqual({
        message: 'User already registered',
        code: 'user_already_exists',
      });
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
      expect(result.payload).toEqual({ message: 'Registration failed', code: undefined });
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
      expect(result.payload).toEqual({ message: 'Registration failed', code: undefined });
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

    it('uses raw_user_meta_data when user_metadata is undefined', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        // user_metadata is undefined, but raw_user_meta_data exists (REST API compatibility)
        raw_user_meta_data: {
          first_name: 'RawFirst',
          last_name: 'RawLast',
          phone_number: '+1234567890',
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
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/fulfilled');
      expect(result.payload).toMatchObject({
        firstName: 'RawFirst',
        lastName: 'RawLast',
        phoneNumber: '+1234567890',
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
      expect(result.payload).toEqual({ message: 'Invalid credentials', code: undefined });
    });

    it('dispatches rejected with error code when AuthError is thrown', async () => {
      (SupabaseAuthClient.signIn as jest.Mock).mockRejectedValue(
        new AuthError('Email not confirmed', 'email_not_confirmed')
      );

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/rejected');
      expect(result.payload).toEqual({
        message: 'Email not confirmed',
        code: 'email_not_confirmed',
      });
    });

    it('handles non-Error rejections', async () => {
      (SupabaseAuthClient.signIn as jest.Mock).mockRejectedValue('Network failure');

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/login/rejected');
      expect(result.payload).toEqual({ message: 'Login failed', code: undefined });
    });
  });

  describe('checkSession', () => {
    it('dispatches fulfilled with user data when authenticated', async () => {
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockResolvedValue(true);

      (SecureStore.get as jest.Mock).mockImplementation((key: SecureStoreKey) => {
        switch (key) {
          case SecureStoreKey.USER_ID:
            return Promise.resolve('user-123');
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
        phoneNumber: null,
        profilePicture: null,
        authProvider: 'email',
      });
    });

    it('dispatches fulfilled with null when not authenticated', async () => {
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockResolvedValue(false);

      const thunk = checkSession();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/checkSession/fulfilled');
      expect(result.payload).toBeNull();
    });

    it('leaves the biometric preference to the persisted slice', async () => {
      // Regression guard: checkSession once read a keychain copy of the
      // preference that nothing wrote, so every cold start clobbered the
      // redux-persist value with false. The payload must not carry it.
      (SupabaseAuthClient.isAuthenticated as jest.Mock).mockResolvedValue(true);

      (SecureStore.get as jest.Mock).mockImplementation((key: SecureStoreKey) => {
        switch (key) {
          case SecureStoreKey.USER_ID:
            return Promise.resolve('user-123');
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
      expect(result.payload).toMatchObject({ authProvider: null });
      expect(result.payload).not.toHaveProperty('biometricEnabled');
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

  describe('refreshUser', () => {
    it('dispatches fulfilled with user data when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'Warren',
          last_name: 'de Leon',
          phone_number: '+447510084239',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('Warren');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('de Leon');
          case EncryptedStoreKey.USER_PHONE_NUMBER:
            return Promise.resolve('+447510084239');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve('email');
          default:
            return Promise.resolve(null);
        }
      });

      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/fulfilled');
      expect(result.payload).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Warren',
        lastName: 'de Leon',
        authProvider: 'email',
      });
    });

    it('dispatches fulfilled with null when user does not exist', async () => {
      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/fulfilled');
      expect(result.payload).toBeNull();
    });

    it('updates storage when backend has newer data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'NewFirstName',
          last_name: 'NewLastName',
          phone_number: '+1234567890',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('OldFirstName');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('OldLastName');
          case EncryptedStoreKey.USER_PHONE_NUMBER:
            return Promise.resolve('+0987654321');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve('email');
          default:
            return Promise.resolve(null);
        }
      });

      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = refreshUser();

      await thunk(mockDispatch, mockGetState, undefined);

      // Should update storage with new values from backend
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_FIRST_NAME,
        'NewFirstName'
      );
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_LAST_NAME,
        'NewLastName'
      );
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_PHONE_NUMBER,
        '+1234567890'
      );
    });

    it('uses raw_user_meta_data when user_metadata is missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        raw_user_meta_data: {
          first_name: 'RawFirst',
          last_name: 'RawLast',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/fulfilled');
      expect(result.payload).toMatchObject({
        firstName: 'RawFirst',
        lastName: 'RawLast',
      });
    });

    it('falls back to storage when metadata values are non-string', async () => {
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

      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('StoredFirst');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('StoredLast');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve('linkedin');
          default:
            return Promise.resolve(null);
        }
      });

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/fulfilled');
      expect(result.payload).toMatchObject({
        firstName: 'StoredFirst',
        lastName: 'StoredLast',
        authProvider: 'linkedin',
      });
    });

    it('dispatches rejected on failure', async () => {
      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch user')
      );

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/rejected');
      expect(result.payload).toBe('Failed to fetch user');
    });

    it('handles non-Error rejections', async () => {
      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockRejectedValue('Network failure');

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/rejected');
      expect(result.payload).toBe('Failed to refresh user');
    });

    it('uses default authProvider when storage returns null', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {},
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = refreshUser();

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/refreshUser/fulfilled');
      expect(result.payload).toMatchObject({
        authProvider: 'email',
      });
    });
  });

  describe('updateUserProfileAsync', () => {
    it('dispatches fulfilled on successful profile update', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'UpdatedFirst',
          last_name: 'UpdatedLast',
          phone_number: '+1234567890',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.PROFILE_PICTURE_URL:
            return Promise.resolve('https://example.com/pic.jpg');
          case EncryptedStoreKey.AUTH_PROVIDER:
            return Promise.resolve('email');
          default:
            return Promise.resolve(null);
        }
      });

      const thunk = updateUserProfileAsync({
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        phoneNumber: '+1234567890',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/updateUserProfile/fulfilled');
      expect(result.payload).toMatchObject({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        phoneNumber: '+1234567890',
        profilePicture: 'https://example.com/pic.jpg',
        authProvider: 'email',
      });
    });

    it('calls updateUser with correct parameters', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
      };

      (SupabaseAuthClient.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const updates = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const thunk = updateUserProfileAsync(updates);

      await thunk(mockDispatch, mockGetState, undefined);

      expect(SupabaseAuthClient.updateUser).toHaveBeenCalledWith(updates);
    });

    it('uses raw_user_meta_data when user_metadata is missing', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        raw_user_meta_data: {
          first_name: 'RawFirst',
          last_name: 'RawLast',
        },
      };

      (SupabaseAuthClient.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = updateUserProfileAsync({ firstName: 'RawFirst' });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.payload).toMatchObject({
        firstName: 'RawFirst',
        lastName: 'RawLast',
      });
    });

    it('falls back to passed values when metadata has non-string values', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          first_name: 123,
          last_name: undefined,
        },
      };

      (SupabaseAuthClient.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = updateUserProfileAsync({
        firstName: 'PassedFirst',
        lastName: 'PassedLast',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.payload).toMatchObject({
        firstName: 'PassedFirst',
        lastName: 'PassedLast',
      });
    });

    it('returns null for missing fields', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
      };

      (SupabaseAuthClient.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = updateUserProfileAsync({});

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.payload).toMatchObject({
        firstName: null,
        lastName: null,
        phoneNumber: null,
        profilePicture: null,
      });
    });

    it('dispatches rejected on failure', async () => {
      (SupabaseAuthClient.updateUser as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const thunk = updateUserProfileAsync({ firstName: 'Test' });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/updateUserProfile/rejected');
      expect(result.payload).toBe('Update failed');
    });

    it('handles non-Error rejections', async () => {
      (SupabaseAuthClient.updateUser as jest.Mock).mockRejectedValue('Network failure');

      const thunk = updateUserProfileAsync({ firstName: 'Test' });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/updateUserProfile/rejected');
      expect(result.payload).toBe('Failed to update profile');
    });

    it('uses default authProvider when storage returns null', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
      };

      (SupabaseAuthClient.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);

      const thunk = updateUserProfileAsync({});

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.payload).toMatchObject({
        authProvider: 'email',
      });
    });
  });

  describe('register edge cases', () => {
    it('handles null email in response user', async () => {
      const mockUser = {
        id: 'user-123',
        email: null, // Email can be null in some auth flows
        aud: 'authenticated',
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token', refresh_token: 'refresh' },
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
      expect(result.payload).toMatchObject({
        email: null,
      });
    });

    it('handles undefined email in response user', async () => {
      const mockUser = {
        id: 'user-123',
        // email is undefined
        aud: 'authenticated',
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token', refresh_token: 'refresh' },
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
      expect(result.payload).toMatchObject({
        email: null, // Should fallback to null via ??
      });
    });

    it('stores phoneNumber when provided', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token', refresh_token: 'refresh' },
      });

      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
        phoneNumber: '+447510084239',
      });

      const result = await thunk(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe('auth/register/fulfilled');
      expect(SupabaseAuthClient.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        data: {
          first_name: 'Warren',
          last_name: 'de Leon',
          phone_number: '+447510084239',
        },
      });

      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_PHONE_NUMBER,
        '+447510084239'
      );
    });

    it('does not include phoneNumber in data when not provided', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: { access_token: 'token', refresh_token: 'refresh' },
      });

      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Warren',
        lastName: 'de Leon',
      });

      await thunk(mockDispatch, mockGetState, undefined);

      // Should not have phone_number in data
      expect(SupabaseAuthClient.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        data: {
          first_name: 'Warren',
          last_name: 'de Leon',
        },
      });

      // Should not store phoneNumber
      expect(EncryptedStore.set).not.toHaveBeenCalledWith(
        EncryptedStoreKey.USER_PHONE_NUMBER,
        expect.anything()
      );
    });
  });

  describe('login storage persistence', () => {
    it('persists metadata to storage when not already stored', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'MetaFirst',
          last_name: 'MetaLast',
          phone_number: '+1234567890',
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

      // Storage is empty - simulate first login on a new device
      (EncryptedStore.get as jest.Mock).mockResolvedValue(null);
      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      await thunk(mockDispatch, mockGetState, undefined);

      // Should persist user_metadata to storage
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_FIRST_NAME,
        'MetaFirst'
      );
      expect(EncryptedStore.set).toHaveBeenCalledWith(EncryptedStoreKey.USER_LAST_NAME, 'MetaLast');
      expect(EncryptedStore.set).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_PHONE_NUMBER,
        '+1234567890'
      );
    });

    it('does not overwrite existing storage values', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          first_name: 'MetaFirst',
          last_name: 'MetaLast',
        },
        created_at: '2025-01-01',
      };

      (SupabaseAuthClient.signIn as jest.Mock).mockResolvedValue({
        access_token: 'token',
        user: mockUser,
      });

      // Storage already has values
      (EncryptedStore.get as jest.Mock).mockImplementation((key: EncryptedStoreKey) => {
        switch (key) {
          case EncryptedStoreKey.USER_FIRST_NAME:
            return Promise.resolve('StoredFirst');
          case EncryptedStoreKey.USER_LAST_NAME:
            return Promise.resolve('StoredLast');
          default:
            return Promise.resolve(null);
        }
      });

      (EncryptedStore.set as jest.Mock).mockResolvedValue(true);

      const thunk = login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      await thunk(mockDispatch, mockGetState, undefined);

      // Should NOT overwrite existing storage
      expect(EncryptedStore.set).not.toHaveBeenCalledWith(
        EncryptedStoreKey.USER_FIRST_NAME,
        expect.anything()
      );
      expect(EncryptedStore.set).not.toHaveBeenCalledWith(
        EncryptedStoreKey.USER_LAST_NAME,
        expect.anything()
      );
    });
  });
});
