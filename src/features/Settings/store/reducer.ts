import { createSlice } from '@reduxjs/toolkit';

import { settingsActions } from './actions';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es';

export interface SettingsState {
  theme: Theme;
  language: Language;
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
};

/**
 * Settings slice for non-sensitive user preferences
 * Persisted using AsyncStorage via redux-persist
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: settingsActions,
});

export const settingsReducer = settingsSlice.reducer;
export const settingsSliceActions = settingsSlice.actions;
