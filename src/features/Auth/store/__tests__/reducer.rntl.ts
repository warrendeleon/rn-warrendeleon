import { checkSession, login, logout, register } from '../actions';
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

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('clearError', () => {
    it('clears error message', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Some error',
      };

      const state = authReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile data', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          profilePicture: null,
          authProvider: 'email',
        },
      };

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
      const state = authReducer(
        initialState,
        updateUserProfile({
          firstName: 'Warren',
        })
      );

      expect(state.user).toBeNull();
    });

    it('updates only provided fields', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const state = authReducer(
        authenticatedState,
        updateUserProfile({
          firstName: 'John',
        })
      );

      expect(state.user?.firstName).toBe('John');
      expect(state.user?.lastName).toBe('de Leon');
      expect(state.user?.profilePicture).toBeNull();
    });
  });

  describe('setBiometricEnabled', () => {
    it('enables biometrics', () => {
      const state = authReducer(initialState, setBiometricEnabled(true));

      expect(state.biometricEnabled).toBe(true);
    });

    it('disables biometrics', () => {
      const stateWithBiometrics: AuthState = {
        ...initialState,
        biometricEnabled: true,
      };

      const state = authReducer(stateWithBiometrics, setBiometricEnabled(false));

      expect(state.biometricEnabled).toBe(false);
    });
  });

  describe('register async thunk', () => {
    it('sets loading to true on pending', () => {
      const action = {
        type: register.pending.type,
      };

      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets authenticated state on fulfilled', () => {
      const action = {
        type: register.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          authProvider: 'email',
        },
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.user?.firstName).toBe('Warren');
      expect(state.user?.lastName).toBe('de Leon');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const action = {
        type: register.rejected.type,
        payload: 'Email already exists',
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('login async thunk', () => {
    it('sets loading to true on pending', () => {
      const action = {
        type: login.pending.type,
      };

      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets authenticated state on fulfilled', () => {
      const action = {
        type: login.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const action = {
        type: login.rejected.type,
        payload: 'Invalid credentials',
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('checkSession async thunk', () => {
    it('sets loading to true on pending', () => {
      const action = {
        type: checkSession.pending.type,
      };

      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
    });

    it('sets authenticated state when session exists', () => {
      const action = {
        type: checkSession.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          profilePicture: null,
          authProvider: 'email',
          biometricEnabled: true,
        },
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.biometricEnabled).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('sets unauthenticated when no session', () => {
      const action = {
        type: checkSession.fulfilled.type,
        payload: null,
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('sets unauthenticated on rejected', () => {
      const action = {
        type: checkSession.rejected.type,
      };

      const state = authReducer(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout async thunk', () => {
    it('sets loading to true on pending', () => {
      const action = {
        type: logout.pending.type,
      };

      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
    });

    it('clears auth state on fulfilled', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          profilePicture: null,
          authProvider: 'email',
        },
        biometricEnabled: true,
      };

      const action = { type: logout.fulfilled.type, payload: null };
      const state = authReducer(authenticatedState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.biometricEnabled).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('clears auth state even on rejected', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const action = {
        type: logout.rejected.type,
        payload: 'Logout failed',
      };
      const state = authReducer(authenticatedState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.biometricEnabled).toBe(false);
      expect(state.error).toBe('Logout failed');
    });
  });
});
