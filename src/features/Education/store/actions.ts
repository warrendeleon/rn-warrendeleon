import { createAsyncThunk } from '@reduxjs/toolkit';

import { GithubApiClient } from '@app/httpClients';
import type { RootState } from '@app/store';
import type { Education } from '@app/types/portfolio';

/**
 * Async thunk to fetch education data from GitHub
 * Uses the current language from settings to fetch the appropriate JSON file
 */
export const fetchEducation = createAsyncThunk<Education[], void, { state: RootState }>(
  'education/fetchEducation',
  async (_, { getState }) => {
    const state = getState();
    const language = state.settings.language;

    const response = await GithubApiClient.get<Education[]>(`/${language}/education.json`);
    return response.data;
  }
);
