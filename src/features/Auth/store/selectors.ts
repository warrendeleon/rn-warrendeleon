import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

/**
 * Base selector for auth slice
 */
const selectAuthState = (state: RootState) => state.auth;

/**
 * Memoized selectors for accessing auth data from state
 * These selectors use createSelector for memoization - they only recompute
 * when the auth slice changes, preventing unnecessary re-renders
 */
export const selectAuth = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  state => state.isAuthenticated
);

export const selectUser = createSelector(selectAuthState, state => state.user);

export const selectAuthLoading = createSelector(selectAuthState, state => state.isLoading);

export const selectAuthError = createSelector(selectAuthState, state => state.error);

export const selectBiometricEnabled = createSelector(
  selectAuthState,
  state => state.biometricEnabled
);

/**
 * Derived selectors for specific user data
 */
export const selectUserFullName = createSelector(selectUser, user =>
  user && user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null
);

export const selectUserEmail = createSelector(selectUser, user => user?.email || null);

export const selectAuthProvider = createSelector(selectUser, user => user?.authProvider || null);
