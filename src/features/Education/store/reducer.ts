import { createSlice } from '@reduxjs/toolkit';

import type { Education } from '@app/types/portfolio';

import { fetchEducation } from './actions';

export interface EducationState {
  data: Education[];
  loading: boolean;
  error: string | null;
}

const initialState: EducationState = {
  data: [],
  loading: false,
  error: null,
};

/**
 * Education slice for managing education data
 * Handles async data fetching from GitHub with loading and error states
 */
const educationSlice = createSlice({
  name: 'education',
  initialState,
  reducers: {
    clearEducation: state => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEducation.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEducation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchEducation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch education';
      });
  },
});

export const educationReducer = educationSlice.reducer;
export const { clearEducation } = educationSlice.actions;
