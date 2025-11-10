// Screen
export { SettingsScreen } from './SettingsScreen';

// Reducer
export type { Language, SettingsState, Theme } from './store/reducer';
export { settingsReducer } from './store/reducer';

// Actions (re-export from slice actions)
import { settingsSliceActions } from './store/reducer';
export const { setTheme, setLanguage, resetSettings } = settingsSliceActions;

// Selectors
export { selectLanguage, selectTheme } from './store/selectors';
