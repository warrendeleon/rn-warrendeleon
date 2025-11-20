import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';
import type { Position } from '@app/types/portfolio';

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
  workExperience =>
    workExperience.filter(item => item.positions.some(position => position.client != null))
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

/**
 * Gets all positions from a specific work experience that have client references
 */
export const selectWorkExperiencePositionsWithClientsById = createSelector(
  selectWorkExperience,
  (_state: RootState, workXPId: string) => workXPId,
  (workExperience, workXPId) => {
    const workXP = workExperience.find(item => item.id === workXPId);
    return workXP?.positions.filter(position => position.client != null) ?? [];
  }
);

/**
 * Finds a position by ID across all work experiences
 * Returns Position for display in details screen
 */
export const selectPositionById = createSelector(
  selectWorkExperience,
  (_state: RootState, id: string) => id,
  (workExperience, id): Position | null => {
    // Handle undefined or empty workExperience
    if (!workExperience || workExperience.length === 0) {
      return null;
    }

    // Search through all work experiences for the position
    for (const item of workExperience) {
      if (item.positions) {
        const position = item.positions.find(p => p.id === id);
        if (position) {
          return position;
        }
      }
    }

    return null;
  }
);

/**
 * Gets the company info for a position by ID
 * Used to display company name and logo in details screen
 * For contract positions, returns the client company info if available
 */
export const selectCompanyInfoByPositionId = createSelector(
  selectWorkExperience,
  (_state: RootState, id: string) => id,
  (workExperience, id) => {
    if (!workExperience || workExperience.length === 0) {
      return null;
    }

    for (const item of workExperience) {
      // Check if position exists in this work experience
      const position = item.positions?.find(p => p.id === id);
      if (position) {
        // If position has a client, return client company info
        if (position.client) {
          return { company: position.client.name, logo: position.client.logo };
        }
        // Otherwise return the work experience company info
        return { company: item.company, logo: item.logo };
      }
    }

    return null;
  }
);
