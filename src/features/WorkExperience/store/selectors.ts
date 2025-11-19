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
 * Finds a work experience, position, or client by ID
 * Searches in order: work experiences, positions within work experiences, clients within work experiences
 * Returns Position-compatible format for display in details screen
 */
export const selectWorkExperienceOrClientById = createSelector(
  selectWorkExperience,
  (_state: RootState, id: string) => id,
  (workExperience, id): Position | null => {
    // Handle undefined or empty workExperience
    if (!workExperience || workExperience.length === 0) {
      return null;
    }

    // Search through all work experiences
    for (const item of workExperience) {
      // Check if it's a position within this work experience
      if (item.positions) {
        const position = item.positions.find(p => p.id === id);
        if (position) {
          return position;
        }
      }

      // Check if it's a client within this work experience
      if (item.clients) {
        const client = item.clients.find(c => c.id === id);
        if (client) {
          // Convert Client to Position-compatible format
          return {
            id: client.id,
            title: client.position,
            start: client.start,
            end: client.end,
            description: client.description,
            programmingLanguages: client.programmingLanguages,
            techStack: client.techStack,
            unitTest: client.unitTest,
            e2e: client.e2e,
            devTools: client.devTools,
            agileMethodology: client.agileMethodology,
          };
        }
      }
    }

    return null;
  }
);

/**
 * Gets the company info for a position or client by ID
 * Used to display company name and logo in details screen
 */
export const selectCompanyInfoByPositionId = createSelector(
  selectWorkExperience,
  (_state: RootState, id: string) => id,
  (workExperience, id) => {
    if (!workExperience || workExperience.length === 0) {
      return null;
    }

    for (const item of workExperience) {
      // Check positions
      if (item.positions?.some(p => p.id === id)) {
        return { company: item.company, logo: item.logo };
      }

      // Check clients
      if (item.clients) {
        const client = item.clients.find(c => c.id === id);
        if (client) {
          return { company: client.company, logo: client.logo };
        }
      }
    }

    return null;
  }
);
