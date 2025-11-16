import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

/**
 * Base selector for work experience slice
 */
const selectWorkExperienceState = (state: RootState) => state.workExperience;

/**
 * Memoized selectors for accessing work experience data from state
 * These selectors use createSelector for memoization - they only recompute
 * when the work experience slice changes, preventing unnecessary re-renders
 */
export const selectWorkExperience = createSelector(selectWorkExperienceState, state => state.data);

export const selectWorkExperienceLoading = createSelector(
  selectWorkExperienceState,
  state => state.loading
);

export const selectWorkExperienceError = createSelector(
  selectWorkExperienceState,
  state => state.error
);

/**
 * Derived selectors for specific work experience data
 */
export const selectWorkExperienceWithClients = createSelector(
  selectWorkExperience,
  workExperience => workExperience.filter(item => item.clients && item.clients.length > 0)
);

export const selectWorkExperienceByCompany = createSelector(
  selectWorkExperience,
  (_state: RootState, company: string) => company,
  (workExperience, company) => workExperience.filter(item => item.company === company)
);

export const selectWorkExperienceById = createSelector(
  selectWorkExperience,
  (_state: RootState, workXPId: string) => workXPId,
  (workExperience, workXPId) => workExperience.find(item => item.id === workXPId) ?? null
);

export const selectWorkExperienceClientsById = createSelector(
  selectWorkExperience,
  (_state: RootState, workXPId: string) => workXPId,
  (workExperience, workXPId) => {
    const workXP = workExperience.find(item => item.id === workXPId);
    return workXP?.clients ?? [];
  }
);
