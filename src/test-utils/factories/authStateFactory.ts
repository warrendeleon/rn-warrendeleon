/**
 * Auth State Factory
 *
 * Creates mock AuthState objects for testing different auth scenarios.
 * Use these factories to set up specific auth states in renderWithProviders.
 */

import type { AuthState } from '@app/features/Auth';

import { createCompleteUser, createLinkedInUser, createMockUser } from './userFactory';

/**
 * Initial/default auth state (loading, checking session)
 */
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  biometricEnabled: false,
};

/**
 * Logged out state (session check complete, no user)
 */
export const loggedOutAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  biometricEnabled: false,
};

/**
 * Authenticated auth state type - guarantees isAuthenticated and user are set
 */
export type AuthenticatedAuthState = AuthState & {
  isAuthenticated: true;
  isLoading: false;
  user: NonNullable<AuthState['user']>;
};

/**
 * Creates an authenticated state with default or custom user
 *
 * Type-safe factory that guarantees the returned state has:
 * - isAuthenticated: true
 * - isLoading: false
 * - user: non-null
 *
 * @param userOverrides - Optional user field overrides
 * @param stateOverrides - Optional auth state overrides
 * @returns Authenticated auth state with merged overrides
 *
 * @example
 * ```typescript
 * // Default authenticated state
 * const state = createAuthenticatedState();
 *
 * // Authenticated with biometrics enabled
 * const biometricState = createAuthenticatedState({}, { biometricEnabled: true });
 *
 * // Custom user
 * const customState = createAuthenticatedState({ firstName: 'Jane' });
 * ```
 */
export function createAuthenticatedState(
  userOverrides?: Partial<NonNullable<AuthState['user']>>,
  stateOverrides?: Partial<Omit<AuthState, 'user'>>
): AuthenticatedAuthState {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: createMockUser(userOverrides),
    error: null,
    biometricEnabled: false,
    ...stateOverrides,
  } as AuthenticatedAuthState;
}

/**
 * Creates an authenticated state with complete user profile
 *
 * @param stateOverrides - Optional auth state overrides
 * @returns Authenticated state with fully populated user
 */
export function createCompleteAuthState(
  stateOverrides?: Partial<Omit<AuthState, 'user'>>
): AuthenticatedAuthState {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: createCompleteUser(),
    error: null,
    biometricEnabled: false,
    ...stateOverrides,
  } as AuthenticatedAuthState;
}

/**
 * Loading auth state type - state during session checks
 */
export type LoadingAuthState = AuthState & {
  isAuthenticated: false;
  isLoading: true;
};

/**
 * Creates a loading state (during login/register/check session)
 *
 * @param userOverrides - Optional user overrides (null for no user)
 * @returns Loading auth state
 */
export function createLoadingAuthState(
  userOverrides: Partial<NonNullable<AuthState['user']>> | null = null
): LoadingAuthState {
  return {
    isAuthenticated: false,
    isLoading: true,
    user: userOverrides ? createMockUser(userOverrides) : null,
    error: null,
    biometricEnabled: false,
  };
}

/**
 * Error auth state type - state with error message
 */
export type ErrorAuthState = AuthState & {
  isLoading: false;
  error: string;
};

/**
 * Creates an error state with specified error message
 *
 * @param error - Error message to display
 * @param isAuthenticated - Whether user was previously authenticated
 * @returns Auth state with error set
 *
 * @example
 * ```typescript
 * // Login failed
 * const loginError = createErrorAuthState('Invalid credentials');
 *
 * // Session expired (was authenticated)
 * const sessionError = createErrorAuthState('Session expired', true);
 * ```
 */
export function createErrorAuthState(
  error: string,
  isAuthenticated: boolean = false
): ErrorAuthState {
  return {
    isAuthenticated,
    isLoading: false,
    user: isAuthenticated ? createMockUser() : null,
    error,
    biometricEnabled: false,
  };
}

/**
 * Biometric auth state type - authenticated with biometrics enabled
 */
export type BiometricAuthState = AuthenticatedAuthState & {
  biometricEnabled: true;
};

/**
 * Creates state with biometric authentication enabled
 *
 * @param userOverrides - Optional user field overrides
 * @returns Authenticated state with biometricEnabled: true
 */
export function createBiometricAuthState(
  userOverrides?: Partial<NonNullable<AuthState['user']>>
): BiometricAuthState {
  return createAuthenticatedState(userOverrides, {
    biometricEnabled: true,
  }) as BiometricAuthState;
}

/**
 * Creates state for LinkedIn OAuth authenticated user
 *
 * @returns Authenticated state with LinkedIn user
 */
export function createLinkedInAuthState(): AuthenticatedAuthState {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: createLinkedInUser(),
    error: null,
    biometricEnabled: false,
  };
}

// Common error scenarios
export const authErrorScenarios = {
  invalidCredentials: createErrorAuthState('Invalid credentials'),
  emailNotConfirmed: createErrorAuthState('Please verify your email address.'),
  accountSuspended: createErrorAuthState('Account suspended. Contact support.'),
  rateLimited: createErrorAuthState('Too many attempts. Please wait 5 minutes.'),
  networkError: createErrorAuthState('No internet connection. Please check your network.'),
  timeout: createErrorAuthState('Request timed out. Please try again.'),
  serverError: createErrorAuthState('Something went wrong. Please try again later.'),
  serviceUnavailable: createErrorAuthState('Service temporarily unavailable. Please try again.'),
  sessionExpired: createErrorAuthState('Your session has expired. Please log in again.'),
} as const;
