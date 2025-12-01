/**
 * Auth Feature
 * Exports auth slice, actions, selectors, screens, context, hooks, and types
 */

export type { AuthState } from './store';
export {
  authReducer,
  checkSession,
  clearError,
  login,
  logout,
  refreshUser,
  register,
  selectAuth,
  selectAuthError,
  selectAuthLoading,
  selectAuthProvider,
  selectBiometricEnabled,
  selectIsAuthenticated,
  selectUser,
  selectUserEmail,
  selectUserFullName,
  setBiometricEnabled,
  updateUserProfile,
  updateUserProfileAsync,
} from './store';

// Context
export type { AuthContextValue } from './context';
export { AuthContext, AuthProvider } from './context';

// Hooks
export { useAuth } from './hooks';

// Screens
export { ChangePasswordScreen } from './ChangePasswordScreen';
export { EditAccountScreen } from './EditAccountScreen';
export { ForgotPasswordScreen } from './ForgotPasswordScreen';
export { LoginScreen } from './LoginScreen';
export { RegistrationScreen } from './RegistrationScreen';
export { ResetPasswordScreen } from './ResetPasswordScreen';

// Utils
export type { RateLimitResult } from './utils/rateLimiter';
export {
  checkPasswordResetRateLimit,
  clearAllRateLimits,
  clearPasswordResetRateLimit,
  getRateLimitStatus,
  recordPasswordResetRequest,
} from './utils/rateLimiter';
