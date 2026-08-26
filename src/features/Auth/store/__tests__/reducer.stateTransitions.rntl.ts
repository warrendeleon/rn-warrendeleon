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

describe('authReducer - State Transitions', () => {
  const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    biometricEnabled: false,
  };

  describe('complex state transition sequences', () => {
    it('handles login → update profile → logout sequence', () => {
      // Step 1: Login
      let state = authReducer(initialState, { type: login.pending.type });
      expect(state.isLoading).toBe(true);

      state = authReducer(state, {
        type: login.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.firstName).toBe('Warren');

      // Step 2: Update profile
      state = authReducer(state, { type: updateUserProfileAsync.pending.type });
      expect(state.isLoading).toBe(true);

      state = authReducer(state, {
        type: updateUserProfileAsync.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Smith',
          phoneNumber: '+447911123456',
          profilePicture: 'https://example.com/pic.jpg',
          authProvider: 'email',
        },
      });
      expect(state.user?.firstName).toBe('John');
      expect(state.user?.lastName).toBe('Smith');
      expect(state.isAuthenticated).toBe(true);

      // Step 3: Logout
      state = authReducer(state, { type: logout.pending.type });
      state = authReducer(state, { type: logout.fulfilled.type, payload: null });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('handles register → immediate profile update sequence', () => {
      // Register
      let state = authReducer(initialState, { type: register.pending.type });
      state = authReducer(state, {
        type: register.fulfilled.type,
        payload: {
          id: 'new-user',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          phoneNumber: null,
          authProvider: 'email',
        },
      });

      // Immediately update profile (sync action)
      state = authReducer(
        state,
        updateUserProfile({
          profilePicture: 'https://example.com/avatar.jpg',
        })
      );

      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.firstName).toBe('New');
      expect(state.user?.profilePicture).toBe('https://example.com/avatar.jpg');
    });

    it('handles checkSession → refreshUser sequence', () => {
      // Check session returns authenticated user; the biometric preference
      // arrives via redux-persist rehydration, not the payload.
      let state = authReducer(
        { ...initialState, biometricEnabled: true },
        { type: checkSession.pending.type }
      );
      state = authReducer(state, {
        type: checkSession.fulfilled.type,
        payload: {
          id: 'restored-user',
          email: 'restored@example.com',
          firstName: 'Restored',
          lastName: 'User',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      expect(state.isAuthenticated).toBe(true);
      expect(state.biometricEnabled).toBe(true);

      // Background refresh updates user data
      state = authReducer(state, {
        type: refreshUser.fulfilled.type,
        payload: {
          id: 'restored-user',
          email: 'restored@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          phoneNumber: '+447911123456',
          profilePicture: 'https://example.com/new-pic.jpg',
          authProvider: 'email',
        },
      });

      expect(state.user?.firstName).toBe('Updated');
      expect(state.user?.phoneNumber).toBe('+447911123456');
      // biometricEnabled should be preserved from session check
      expect(state.biometricEnabled).toBe(true);
    });
  });

  describe('state rollback on action failure', () => {
    it('preserves authenticated state when profile update fails', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      };

      // Start profile update
      let state = authReducer(authenticatedState, {
        type: updateUserProfileAsync.pending.type,
      });

      // Profile update fails
      state = authReducer(state, {
        type: updateUserProfileAsync.rejected.type,
        payload: 'Network error',
      });

      // User data should be unchanged (no rollback needed - original preserved)
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.firstName).toBe('Warren');
      expect(state.user?.lastName).toBe('de Leon');
      expect(state.error).toBe('Network error');
    });

    it('maintains session on refreshUser failure', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      };

      // refreshUser fails silently (no rejected handler changes state)
      const state = authReducer(authenticatedState, {
        type: refreshUser.rejected.type,
        payload: 'Network error',
      });

      // User should remain authenticated with original data
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.firstName).toBe('Warren');
    });
  });

  describe('partial state updates preserve unaffected data', () => {
    it('updateUserProfile preserves all unmodified fields', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        biometricEnabled: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: '+447911123456',
          profilePicture: 'https://example.com/pic.jpg',
          authProvider: 'linkedin',
        },
      };

      // Update only firstName
      const state = authReducer(authenticatedState, updateUserProfile({ firstName: 'John' }));

      expect(state.user?.firstName).toBe('John');
      // All other fields preserved
      expect(state.user?.lastName).toBe('de Leon');
      expect(state.user?.phoneNumber).toBe('+447911123456');
      expect(state.user?.profilePicture).toBe('https://example.com/pic.jpg');
      expect(state.user?.authProvider).toBe('linkedin');
      expect(state.user?.id).toBe('user-123');
      expect(state.user?.email).toBe('test@example.com');
      // Top-level state preserved
      expect(state.isAuthenticated).toBe(true);
      expect(state.biometricEnabled).toBe(true);
    });

    it('setBiometricEnabled preserves all other state', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        error: 'Previous error',
        biometricEnabled: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const state = authReducer(authenticatedState, setBiometricEnabled(true));

      expect(state.biometricEnabled).toBe(true);
      // All other state preserved
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe('Previous error');
      expect(state.user?.firstName).toBe('Warren');
    });

    it('clearError preserves user and auth state', () => {
      const stateWithError: AuthState = {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        error: 'Some error',
        biometricEnabled: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      };

      const state = authReducer(stateWithError, clearError());

      expect(state.error).toBeNull();
      // All other state preserved
      expect(state.isAuthenticated).toBe(true);
      expect(state.biometricEnabled).toBe(true);
      expect(state.user?.firstName).toBe('Warren');
    });
  });

  describe('concurrent actions on same state slice', () => {
    it('handles rapid sequential login attempts correctly', () => {
      // First login attempt starts
      let state = authReducer(initialState, { type: login.pending.type });
      expect(state.isLoading).toBe(true);

      // Second login attempt starts (simulating double-tap)
      state = authReducer(state, { type: login.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      // First attempt completes
      state = authReducer(state, {
        type: login.fulfilled.type,
        payload: {
          id: 'user-1',
          email: 'first@example.com',
          firstName: 'First',
          lastName: 'User',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('first@example.com');
    });

    it('handles profile update during logout correctly', () => {
      const authenticatedState: AuthState = {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      };

      // Start profile update
      let state = authReducer(authenticatedState, {
        type: updateUserProfileAsync.pending.type,
      });

      // Logout starts during update
      state = authReducer(state, { type: logout.pending.type });

      // Logout completes first
      state = authReducer(state, { type: logout.fulfilled.type, payload: null });

      // User should be logged out
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();

      // Profile update completes after logout - should update user even though logged out
      // This documents actual behaviour (reducer doesn't check auth status)
      state = authReducer(state, {
        type: updateUserProfileAsync.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      // The reducer sets user from payload regardless of auth state
      expect(state.user?.firstName).toBe('Updated');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('action payload transformation edge cases', () => {
    it('handles register payload without optional phoneNumber', () => {
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

      expect(state.user?.phoneNumber).toBeUndefined();
      expect(state.user?.profilePicture).toBeNull();
    });

    it('keeps a true biometric preference through checkSession', () => {
      // The preference is rehydrated by redux-persist; checkSession.fulfilled
      // must not overwrite it (it once clobbered the persisted value).
      const rehydrated = { ...initialState, biometricEnabled: true };
      const state = authReducer(rehydrated, {
        type: checkSession.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      expect(state.biometricEnabled).toBe(true);
    });

    it('keeps a false biometric preference through checkSession', () => {
      const state = authReducer(initialState, {
        type: checkSession.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: 'email',
        },
      });

      expect(state.biometricEnabled).toBe(false);
    });

    it('handles login payload with all auth providers', () => {
      const providers: Array<'email' | 'linkedin' | 'magic_link'> = [
        'email',
        'linkedin',
        'magic_link',
      ];

      providers.forEach(provider => {
        const state = authReducer(initialState, {
          type: login.fulfilled.type,
          payload: {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Warren',
            lastName: 'de Leon',
            phoneNumber: null,
            profilePicture: null,
            authProvider: provider,
          },
        });

        expect(state.user?.authProvider).toBe(provider);
      });
    });

    it('handles null authProvider in payload', () => {
      const state = authReducer(initialState, {
        type: login.fulfilled.type,
        payload: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Warren',
          lastName: 'de Leon',
          phoneNumber: null,
          profilePicture: null,
          authProvider: null,
        },
      });

      expect(state.user?.authProvider).toBeNull();
    });
  });
});
