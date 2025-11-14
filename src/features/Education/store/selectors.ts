import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

/**
 * Base selector for education slice
 */
const selectEducationState = (state: RootState) => state.education;

/**
 * Memoized selectors for accessing education data from state
 * These selectors use createSelector for memoization - they only recompute
 * when the education slice changes, preventing unnecessary re-renders
 */
export const selectEducation = createSelector(selectEducationState, state => state.data);

export const selectEducationLoading = createSelector(selectEducationState, state => state.loading);

export const selectEducationError = createSelector(selectEducationState, state => state.error);

/**
 * Derived selectors for specific education data
 */
export const selectEducationWithCertificates = createSelector(selectEducation, education =>
  education.filter(item => item.certificate)
);

export const selectEducationByLocation = createSelector(
  selectEducation,
  (_state: RootState, location: string) => location,
  (education, location) => education.filter(item => item.location === location)
);
