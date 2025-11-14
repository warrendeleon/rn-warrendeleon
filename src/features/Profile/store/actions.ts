import { createAsyncThunk } from '@reduxjs/toolkit';

import { GithubApiClient } from '@app/httpClients';
import type { RootState } from '@app/store';
import type { Profile } from '@app/types/portfolio';

/**
 * Async thunk to fetch profile data from GitHub
 * Uses the current language from settings to fetch the appropriate JSON file
 */
export const fetchProfile = createAsyncThunk<Profile, void, { state: RootState }>(
  'profile/fetchProfile',
  async (_, { getState }) => {
    const state = getState();
    const language = state.settings.language;

    const response = await GithubApiClient.get<Profile>(`/${language}/profile.json`);
    return response.data;
  }
);
