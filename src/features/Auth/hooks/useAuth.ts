import { useContext } from 'react';

import type { AuthContextValue } from '../context';
import { AuthContext } from '../context';

/**
 * useAuth Hook
 *
 * Provides access to auth context.
 * Must be used within AuthProvider.
 *
 * @returns AuthContextValue
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, setIntendedRoute } = useAuth();
 *
 * if (!isAuthenticated) {
 *   setIntendedRoute('BookACall');
 *   navigation.navigate('Login');
 * }
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
