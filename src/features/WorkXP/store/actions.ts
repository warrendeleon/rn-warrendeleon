import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

import { fetchWorkXPData } from '../api/api';

/**
 * Async thunk to fetch work experience data from GitHub
 * Uses the current language from settings to fetch the appropriate JSON file
 */
export const fetchWorkXP = createAsyncThunk<WorkExperience[], void, { state: RootState }>(
  'workXP/fetchWorkXP',
  async (_, { getState }) => {
    const state = getState();
    const language = state.settings.language;

    const response = await fetchWorkXPData(language);
    return response.data;
  }
);
