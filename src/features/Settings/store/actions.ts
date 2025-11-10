import type { PayloadAction } from '@reduxjs/toolkit';

import type { Language, SettingsState, Theme } from './reducer';

/**
 * Settings actions for managing user preferences
 */
export const settingsActions = {
  setTheme: (state: SettingsState, action: PayloadAction<Theme>) => {
    state.theme = action.payload;
  },
  setLanguage: (state: SettingsState, action: PayloadAction<Language>) => {
    state.language = action.payload;
  },
  resetSettings: (): SettingsState => ({
    theme: 'system',
    language: 'en',
  }),
};
