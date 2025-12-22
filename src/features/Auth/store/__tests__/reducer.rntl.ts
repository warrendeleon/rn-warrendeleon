import {
  checkSession,
  login,
  logout,
  refreshUser,
  register,
  updateUserProfileAsync,
} from '../actions';
import {
  authReducer,
  AuthState,
  clearError,
  setBiometricEnabled,
  updateUserProfile,
} from '../reducer';

describe('authReducer', () => {
  const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    biometricEnabled: false,
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Warren',
    lastName: 'de Leon',
    phoneNumber: null,
    profilePicture: null,
    authProvider: 'email' as const,
  };

  const authenticatedState: AuthState = {
    ...initialState,
    isAuthenticated: true,
    user: mockUser,
  };

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('clearError', () => {
    it('clears error message', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      expect(authReducer(stateWithError, clearError()).error).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile data', () => {
      const state = authReducer(
        authenticatedState,
        updateUserProfile({
          firstName: 'Warren',
          lastName: 'de Leon Jr.',
          profilePicture: 'https://example.com/picture.jpg',
        })
      );
      expect(state.user?.firstName).toBe('Warren');
      expect(state.user?.lastName).toBe('de Leon Jr.');
      expect(state.user?.profilePicture).toBe('https://example.com/picture.jpg');
    });

    it('does not update if user is null', () => {
      const state = authReducer(initialState, updateUserProfile({ firstName: 'Warren' }));
      expect(state.user).toBeNull();
    });

    it('updates only provided fields', () => {
      const state = authReducer(authenticatedState, updateUserProfile({ firstName: 'John' }));
      expect(state.user?.firstName).toBe('John');
      expect(state.user?.lastName).toBe('de Leon');
      expect(state.user?.profilePicture).toBeNull();
    });

    it('updates lastName independently', () => {
      const state = authReducer(authenticatedState, updateUserProfile({ lastName: 'Smith' }));
      expect(state.user?.lastName).toBe('Smith');
      expect(state.user?.firstName).toBe('Warren');
    });

    it('updates profilePicture independently', () => {
      const state = authReducer(
        authenticatedState,
        updateUserProfile({ profilePicture: 'https://example.com/pic.jpg' })
      );
      expect(state.user?.profilePicture).toBe('https://example.com/pic.jpg');
      expect(state.user?.firstName).toBe('Warren');
    });
  });

  describe('setBiometricEnabled', () => {
    it('enables biometrics', () => {
      expect(authReducer(initialState, setBiometricEnabled(true)).biometricEnabled).toBe(true);
    });

    it('disables biometrics', () => {
      const stateWithBiometrics = { ...initialState, biometricEnabled: true };
      expect(authReducer(stateWithBiometrics, setBiometricEnabled(false)).biometricEnabled).toBe(
        false
      );
    });
  });

  describe('register async thunk', () => {
    it('sets loading to true on pending', () => {
      const state = authReducer(initialState, { type: register.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets authenticated state on fulfilled', () => {
      const state = authReducer(initialState, {
        type: register.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          authProvider: 'email',
        },
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const state = authReducer(initialState, {
        type: register.rejected.type,
        payload: 'Email already exists',
      });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('login async thunk', () => {
    it('sets loading to true on pending', () => {
      const state = authReducer(initialState, { type: login.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets authenticated state on fulfilled', () => {
      const state = authReducer(initialState, { type: login.fulfilled.type, payload: mockUser });
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const state = authReducer(initialState, {
        type: login.rejected.type,
        payload: 'Invalid credentials',
      });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('checkSession async thunk', () => {
    it('sets loading to true on pending', () => {
      expect(authReducer(initialState, { type: checkSession.pending.type }).isLoading).toBe(true);
    });

    it('sets authenticated state when session exists', () => {
      const state = authReducer(initialState, {
        type: checkSession.fulfilled.type,
        payload: { ...mockUser, biometricEnabled: true },
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.biometricEnabled).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('sets unauthenticated when no session', () => {
      const state = authReducer(initialState, { type: checkSession.fulfilled.type, payload: null });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('sets unauthenticated on rejected', () => {
      const state = authReducer(initialState, { type: checkSession.rejected.type });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout async thunk', () => {
    it('sets loading to true on pending', () => {
      expect(authReducer(initialState, { type: logout.pending.type }).isLoading).toBe(true);
    });

    it('clears auth state on fulfilled', () => {
      const stateWithBiometrics = { ...authenticatedState, biometricEnabled: true };
      const state = authReducer(stateWithBiometrics, {
        type: logout.fulfilled.type,
        payload: null,
      });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.biometricEnabled).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('clears auth state even on rejected', () => {
      const state = authReducer(authenticatedState, {
        type: logout.rejected.type,
        payload: 'Logout failed',
      });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.biometricEnabled).toBe(false);
      expect(state.error).toBe('Logout failed');
    });
  });

  describe('refreshUser async thunk', () => {
    it('updates user on fulfilled with payload', () => {
      const updatedUser = {
        ...mockUser,
        firstName: 'NewFirst',
        lastName: 'NewLast',
        phoneNumber: '+1234567890',
      };
      const state = authReducer(authenticatedState, {
        type: refreshUser.fulfilled.type,
        payload: updatedUser,
      });
      expect(state.user?.firstName).toBe('NewFirst');
      expect(state.user?.lastName).toBe('NewLast');
      expect(state.user?.phoneNumber).toBe('+1234567890');
    });

    it('does not update user on fulfilled with null payload', () => {
      const state = authReducer(authenticatedState, {
        type: refreshUser.fulfilled.type,
        payload: null,
      });
      expect(state.user?.firstName).toBe('Warren');
      expect(state.user?.lastName).toBe('de Leon');
    });
  });

  describe('updateUserProfileAsync async thunk', () => {
    it('sets loading to true on pending', () => {
      const state = authReducer(initialState, { type: updateUserProfileAsync.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates user on fulfilled', () => {
      const loadingState = { ...authenticatedState, isLoading: true };
      const updatedUser = { ...mockUser, firstName: 'UpdatedFirst', lastName: 'UpdatedLast' };
      const state = authReducer(loadingState, {
        type: updateUserProfileAsync.fulfilled.type,
        payload: updatedUser,
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(updatedUser);
    });

    it('sets error on rejected', () => {
      const loadingState = { ...authenticatedState, isLoading: true };
      const state = authReducer(loadingState, {
        type: updateUserProfileAsync.rejected.type,
        payload: 'Failed to update profile',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to update profile');
    });

    it('handles AuthErrorPayload format for rejected', () => {
      const state = authReducer(initialState, {
        type: updateUserProfileAsync.rejected.type,
        payload: { message: 'Profile update error', code: 'PROFILE_ERROR' },
      });
      expect(state.error).toBe('Profile update error');
    });
  });

  describe('extractErrorMessage helper', () => {
    it('handles string payload', () => {
      const state = authReducer(initialState, {
        type: register.rejected.type,
        payload: 'Simple error message',
      });
      expect(state.error).toBe('Simple error message');
    });

    it('handles AuthErrorPayload object', () => {
      const state = authReducer(initialState, {
        type: register.rejected.type,
        payload: { message: 'Auth error message', code: 'AUTH_ERROR' },
      });
      expect(state.error).toBe('Auth error message');
    });

    it('handles null/undefined payload', () => {
      const state = authReducer(initialState, { type: register.rejected.type, payload: null });
      expect(state.error).toBe('An error occurred');
    });

    it('handles empty object payload', () => {
      const state = authReducer(initialState, { type: login.rejected.type, payload: {} });
      expect(state.error).toBe('An error occurred');
    });

    it('handles number payload', () => {
      const state = authReducer(initialState, { type: login.rejected.type, payload: 500 });
      expect(state.error).toBe('An error occurred');
    });
  });
});
