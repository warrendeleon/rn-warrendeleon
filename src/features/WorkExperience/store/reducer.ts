import { createSlice } from '@reduxjs/toolkit';

import type { WorkExperience } from '@app/types/portfolio';

import { fetchWorkExperience } from './actions';

export interface WorkExperienceState {
  data: WorkExperience[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkExperienceState = {
  data: [],
  loading: false,
  error: null,
};

/**
 * Work experience slice for managing work experience data
 * Handles async data fetching from GitHub with loading and error states
 */
const workExperienceSlice = createSlice({
  name: 'workExperience',
  initialState,
  reducers: {
    clearWorkExperience: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWorkExperience.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkExperience.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch work experience';
      });
  },
});

export const workExperienceReducer = workExperienceSlice.reducer;
export const { clearWorkExperience } = workExperienceSlice.actions;
