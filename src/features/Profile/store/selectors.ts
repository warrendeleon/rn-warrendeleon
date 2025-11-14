import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

/**
 * Base selector for profile slice
 */
const selectProfileState = (state: RootState) => state.profile;

/**
 * Memoized selectors for accessing profile data from state
 * These selectors use createSelector for memoization - they only recompute
 * when the profile slice changes, preventing unnecessary re-renders
 */
export const selectProfile = createSelector(selectProfileState, state => state.data);

export const selectProfileLoading = createSelector(selectProfileState, state => state.loading);

export const selectProfileError = createSelector(selectProfileState, state => state.error);

/**
 * Derived selectors for specific profile data
 */
export const selectProfileName = createSelector(selectProfile, profile =>
  profile ? `${profile.name} ${profile.lastName}` : null
);

export const selectProfileLocation = createSelector(
  selectProfile,
  profile => profile?.location || null
);

export const selectProfileSocials = createSelector(
  selectProfile,
  profile => profile?.socials || null
);
