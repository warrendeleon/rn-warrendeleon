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

/**
 * Finds a work experience or client by ID
 * First searches top-level work experiences, then searches within clients arrays
 * Converts Client to WorkExperience-compatible format for display
 */
export const selectWorkExperienceOrClientById = createSelector(
  selectWorkExperience,
  (_state: RootState, id: string) => id,
  (workExperience, id) => {
    // Handle undefined or empty workExperience
    if (!workExperience || workExperience.length === 0) {
      return null;
    }

    // First check if it's a work experience
    const workXP = workExperience.find(item => item.id === id);
    if (workXP) {
      return workXP;
    }

    // If not found, search in clients arrays
    for (const item of workExperience) {
      if (item.clients) {
        const client = item.clients.find(c => c.id === id);
        if (client) {
          // Convert Client to WorkExperience format
          return {
            id: client.id,
            company: client.company,
            logo: client.logo,
            position: client.position,
            start: client.start,
            end: client.end,
            programmingLanguages: client.programmingLanguages,
            techStack: client.techStack,
            unitTest: client.unitTest,
            e2e: client.e2e,
            devTools: client.devTools,
            agileMethodology: client.agileMethodology,
            description: client.description,
            // Clients don't have sub-clients
            clients: undefined,
          };
        }
      }
    }

    return null;
  }
);
