import { createAsyncThunk } from '@reduxjs/toolkit';

import { GithubApiClient } from '@app/httpClients';
import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

/**
 * Async thunk to fetch work experience data from GitHub
 * Uses the current language from settings to fetch the appropriate JSON file
 */
export const fetchWorkXP = createAsyncThunk<WorkExperience[], void, { state: RootState }>(
  'workXP/fetchWorkXP',
  async (_, { getState }) => {
    const state = getState();
    const language = state.settings.language;

    const response = await GithubApiClient.get<WorkExperience[]>(`/${language}/workxp.json`);
    return response.data;
  }
);
