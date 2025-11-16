import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

import { fetchWorkExperienceData } from '../api/api';

/**
 * Async thunk to fetch work experience data from GitHub
 * Uses the current language from settings to fetch the appropriate JSON file
 */
export const fetchWorkExperience = createAsyncThunk<WorkExperience[], void, { state: RootState }>(
  'workExperience/fetchWorkExperience',
  async (_, { getState }) => {
    const state = getState();
    const language = state.settings.language;

    const response = await fetchWorkExperienceData(language);
    return response.data;
  }
);
