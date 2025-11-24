import type { RootState } from '@app/store';

import {
  selectAuth,
  selectAuthError,
  selectAuthLoading,
  selectAuthProvider,
  selectBiometricEnabled,
  selectIsAuthenticated,
  selectUser,
  selectUserEmail,
  selectUserFullName,
} from '../selectors';

describe('Auth selectors', () => {
  const mockState = {
    auth: {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Warren',
        lastName: 'de Leon',
        profilePicture: 'https://example.com/picture.jpg',
        authProvider: 'email' as const,
      },
      error: null,
      biometricEnabled: true,
    },
  } as RootState;

  describe('selectAuth', () => {
    it('returns the entire auth state', () => {
      expect(selectAuth(mockState)).toEqual(mockState.auth);
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectAuth(mockState);
      const result2 = selectAuth(mockState);

      expect(result1).toBe(result2);
    });

    it('recomputes when auth slice changes', () => {
      const state1 = mockState;
      const state2 = {
        auth: {
          ...mockState.auth,
          isAuthenticated: false,
        },
      } as RootState;

      const result1 = selectAuth(state1);
      const result2 = selectAuth(state2);

      expect(result1).not.toBe(result2);
      expect(result1.isAuthenticated).toBe(true);
      expect(result2.isAuthenticated).toBe(false);
    });
  });

  describe('selectIsAuthenticated', () => {
    it('returns the authentication status', () => {
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectIsAuthenticated(mockState);
      const result2 = selectIsAuthenticated(mockState);

      expect(result1).toBe(result2);
    });

    it('recomputes when auth slice changes', () => {
      const state1 = mockState;
      const state2 = {
        auth: {
          ...mockState.auth,
          isAuthenticated: false,
        },
      } as RootState;

      const result1 = selectIsAuthenticated(state1);
      const result2 = selectIsAuthenticated(state2);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('selectUser', () => {
    it('returns the user data', () => {
      expect(selectUser(mockState)).toEqual(mockState.auth.user);
    });

    it('returns null when no user', () => {
      const stateWithoutUser = {
        auth: {
          ...mockState.auth,
          user: null,
        },
      } as RootState;

      expect(selectUser(stateWithoutUser)).toBeNull();
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectUser(mockState);
      const result2 = selectUser(mockState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectAuthLoading', () => {
    it('returns the loading state', () => {
      expect(selectAuthLoading(mockState)).toBe(false);
    });

    it('returns true when loading', () => {
      const loadingState = {
        auth: {
          ...mockState.auth,
          isLoading: true,
        },
      } as RootState;

      expect(selectAuthLoading(loadingState)).toBe(true);
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectAuthLoading(mockState);
      const result2 = selectAuthLoading(mockState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectAuthError', () => {
    it('returns null when no error', () => {
      expect(selectAuthError(mockState)).toBeNull();
    });

    it('returns error message when present', () => {
      const errorState = {
        auth: {
          ...mockState.auth,
          error: 'Invalid credentials',
        },
      } as RootState;

      expect(selectAuthError(errorState)).toBe('Invalid credentials');
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectAuthError(mockState);
      const result2 = selectAuthError(mockState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectBiometricEnabled', () => {
    it('returns the biometric enabled status', () => {
      expect(selectBiometricEnabled(mockState)).toBe(true);
    });

    it('returns false when disabled', () => {
      const disabledState = {
        auth: {
          ...mockState.auth,
          biometricEnabled: false,
        },
      } as RootState;

      expect(selectBiometricEnabled(disabledState)).toBe(false);
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectBiometricEnabled(mockState);
      const result2 = selectBiometricEnabled(mockState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectUserFullName', () => {
    it('returns full name when both firstName and lastName present', () => {
      expect(selectUserFullName(mockState)).toBe('Warren de Leon');
    });

    it('returns null when user is null', () => {
      const stateWithoutUser = {
        auth: {
          ...mockState.auth,
          user: null,
        },
      } as RootState;

      expect(selectUserFullName(stateWithoutUser)).toBeNull();
    });

    it('returns null when firstName is missing', () => {
      const stateWithoutFirstName = {
        auth: {
          ...mockState.auth,
          user: {
            ...mockState.auth.user!,
            firstName: null,
          },
        },
      } as RootState;

      expect(selectUserFullName(stateWithoutFirstName)).toBeNull();
    });

    it('returns null when lastName is missing', () => {
      const stateWithoutLastName = {
        auth: {
          ...mockState.auth,
          user: {
            ...mockState.auth.user!,
            lastName: null,
          },
        },
      } as RootState;

      expect(selectUserFullName(stateWithoutLastName)).toBeNull();
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectUserFullName(mockState);
      const result2 = selectUserFullName(mockState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectUserEmail', () => {
    it('returns user email', () => {
      expect(selectUserEmail(mockState)).toBe('test@example.com');
    });

    it('returns null when user is null', () => {
      const stateWithoutUser = {
        auth: {
          ...mockState.auth,
          user: null,
        },
      } as RootState;

      expect(selectUserEmail(stateWithoutUser)).toBeNull();
    });

    it('returns null when email is missing', () => {
      const stateWithoutEmail = {
        auth: {
          ...mockState.auth,
          user: {
            ...mockState.auth.user!,
            email: null,
          },
        },
      } as RootState;

      expect(selectUserEmail(stateWithoutEmail)).toBeNull();
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectUserEmail(mockState);
      const result2 = selectUserEmail(mockState);

      expect(result1).toBe(result2);
    });
  });

  describe('selectAuthProvider', () => {
    it('returns auth provider', () => {
      expect(selectAuthProvider(mockState)).toBe('email');
    });

    it('returns null when user is null', () => {
      const stateWithoutUser = {
        auth: {
          ...mockState.auth,
          user: null,
        },
      } as RootState;

      expect(selectAuthProvider(stateWithoutUser)).toBeNull();
    });

    it('returns null when authProvider is missing', () => {
      const stateWithoutProvider = {
        auth: {
          ...mockState.auth,
          user: {
            ...mockState.auth.user!,
            authProvider: null,
          },
        },
      } as RootState;

      expect(selectAuthProvider(stateWithoutProvider)).toBeNull();
    });

    it('is memoized - returns same reference when state unchanged', () => {
      const result1 = selectAuthProvider(mockState);
      const result2 = selectAuthProvider(mockState);

      expect(result1).toBe(result2);
    });
  });
});
