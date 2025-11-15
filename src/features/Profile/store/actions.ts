import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';
import type { Profile } from '@app/types/portfolio';

import { fetchProfileData } from '../api/api';

/**
 * Async thunk to fetch profile data from GitHub
 * Uses the current language from settings to fetch the appropriate JSON file
 */
export const fetchProfile = createAsyncThunk<Profile, void, { state: RootState }>(
  'profile/fetchProfile',
  async (_, { getState }) => {
    const state = getState();
    const language = state.settings.language;

    const response = await fetchProfileData(language);
    return response.data;
  }
);
