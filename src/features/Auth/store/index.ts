// Store exports
export type { AuthState } from './reducer';
export { authReducer, clearError, setBiometricEnabled, updateUserProfile } from './reducer';

// Actions
export { checkSession, login, logout, register } from './actions';

// Selectors
export {
  selectAuth,
  selectAuthError,
  selectAuthLoading,
  selectAuthProvider,
  selectBiometricEnabled,
  selectIsAuthenticated,
  selectUser,
  selectUserEmail,
  selectUserFullName,
} from './selectors';
