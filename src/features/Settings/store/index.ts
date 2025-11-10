// Store exports
export type { Language, SettingsState, Theme } from './reducer';
export { settingsReducer } from './reducer';

// Actions
import { settingsSliceActions } from './reducer';
export const { setTheme, setLanguage, resetSettings } = settingsSliceActions;

// Selectors
export { selectLanguage, selectTheme } from './selectors';
