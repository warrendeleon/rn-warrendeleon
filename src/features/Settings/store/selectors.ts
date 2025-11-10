import type { RootState } from '@app/store';

/**
 * Settings selectors for accessing user preferences from state
 */
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;
