/**
 * Auth Feature
 * Exports auth slice, actions, selectors, screens, and types
 */

export type { AuthState } from './store';
export {
  authReducer,
  checkSession,
  clearError,
  login,
  logout,
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
} from './store';

// Screens
export { RegistrationScreen } from './RegistrationScreen';
