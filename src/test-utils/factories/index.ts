/**
 * Test Factories
 *
 * Centralised exports for all test factory functions.
 * Use these to create consistent mock data across tests.
 */

// User factories
export {
  createCompleteUser,
  createLinkedInUser,
  createMagicLinkUser,
  createMockUser,
  createMockUsers,
  createVerifiedUser,
} from './userFactory';

// Auth state factories
export type {
  AuthenticatedAuthState,
  BiometricAuthState,
  ErrorAuthState,
  LoadingAuthState,
} from './authStateFactory';
export {
  authErrorScenarios,
  createAuthenticatedState,
  createBiometricAuthState,
  createCompleteAuthState,
  createErrorAuthState,
  createLinkedInAuthState,
  createLoadingAuthState,
  initialAuthState,
  loggedOutAuthState,
} from './authStateFactory';

// Navigation factories
export type { ScreenTestProps } from './navigationFactory';
export {
  createMockNavigation,
  createMockRoute,
  createScreenProps,
  editAccountScreenProps,
  forgotPasswordScreenProps,
  homeScreenProps,
  loginScreenProps,
  profileScreenProps,
  registrationScreenProps,
  resetPasswordScreenProps,
  settingsScreenProps,
} from './navigationFactory';
