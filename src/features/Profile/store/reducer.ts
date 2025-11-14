import { createSlice } from '@reduxjs/toolkit';

import type { Profile } from '@app/types/portfolio';

import { fetchProfile } from './actions';

export interface ProfileState {
  data: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Profile slice for managing user profile data
 * Handles async data fetching from GitHub with loading and error states
 */
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: state => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      });
  },
});

export const profileReducer = profileSlice.reducer;
export const { clearProfile } = profileSlice.actions;
