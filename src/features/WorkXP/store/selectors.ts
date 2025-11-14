import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

/**
 * Base selector for workXP slice
 */
const selectWorkXPState = (state: RootState) => state.workXP;

/**
 * Memoized selectors for accessing work experience data from state
 * These selectors use createSelector for memoization - they only recompute
 * when the workXP slice changes, preventing unnecessary re-renders
 */
export const selectWorkXP = createSelector(selectWorkXPState, state => state.data);

export const selectWorkXPLoading = createSelector(selectWorkXPState, state => state.loading);

export const selectWorkXPError = createSelector(selectWorkXPState, state => state.error);

/**
 * Derived selectors for specific work experience data
 */
export const selectCurrentPosition = createSelector(selectWorkXP, workXP => {
  const current = workXP.find(
    job =>
      job.end.toLowerCase() === 'present' ||
      job.end.toLowerCase() === 'current' ||
      job.end.toLowerCase().includes('now')
  );
  return current || null;
});

export const selectWorkXPByCompany = createSelector(
  selectWorkXP,
  (_state: RootState, company: string) => company,
  (workXP, company) => workXP.filter(job => job.company === company)
);
