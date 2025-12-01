import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { setOnAuthTokensStored } from '@app/navigation';
import { useAppDispatch, useAppSelector } from '@app/store';

import type { AuthState } from '../store';
import { checkSession, selectAuthLoading, selectIsAuthenticated, selectUser } from '../store';

/**
 * AuthContext Value Interface
 */
export interface AuthContextValue {
  // State (from Redux selectors)
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthState['user'];

  // Navigation helpers
  intendedRoute: string | null;
  setIntendedRoute: (route: string | null) => void;
  clearIntendedRoute: () => void;
}

/**
 * AuthContext
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 *
 * Wraps the app to provide auth context.
 * - Subscribes to Redux auth selectors
 * - Dispatches checkSession on mount
 * - Tracks intended route for post-login redirect
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Subscribe to Redux selectors
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const user = useAppSelector(selectUser);

  // Local state for intended route (navigation-specific, not in Redux)
  const [intendedRoute, setIntendedRouteState] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  // Register callback for deep link auth token storage
  // This ensures auth state is refreshed when tokens are stored via deep link
  useEffect(() => {
    const handleDeepLinkAuth = () => {
      dispatch(checkSession());
    };

    setOnAuthTokensStored(handleDeepLinkAuth);

    return () => {
      setOnAuthTokensStored(null);
    };
  }, [dispatch]);

  // Navigation helpers
  const setIntendedRoute = useCallback((route: string | null) => {
    setIntendedRouteState(route);
  }, []);

  const clearIntendedRoute = useCallback(() => {
    setIntendedRouteState(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      intendedRoute,
      setIntendedRoute,
      clearIntendedRoute,
    }),
    [isAuthenticated, isLoading, user, intendedRoute, setIntendedRoute, clearIntendedRoute]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
