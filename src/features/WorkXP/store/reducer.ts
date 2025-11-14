import { createSlice } from '@reduxjs/toolkit';

import type { WorkExperience } from '@app/types/portfolio';

import { fetchWorkXP } from './actions';

export interface WorkXPState {
  data: WorkExperience[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkXPState = {
  data: [],
  loading: false,
  error: null,
};

/**
 * WorkXP slice for managing work experience data
 * Handles async data fetching from GitHub with loading and error states
 */
const workXPSlice = createSlice({
  name: 'workXP',
  initialState,
  reducers: {
    clearWorkXP: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWorkXP.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkXP.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkXP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch work experience';
      });
  },
});

export const workXPReducer = workXPSlice.reducer;
export const { clearWorkXP } = workXPSlice.actions;
