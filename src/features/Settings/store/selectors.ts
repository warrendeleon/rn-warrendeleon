import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@app/store';

/**
 * Base selector for settings slice
 */
const selectSettings = (state: RootState) => state.settings;

/**
 * Memoized selectors for accessing user preferences from state
 * These selectors use createSelector for memoization - they only recompute
 * when the settings slice changes, preventing unnecessary re-renders
 */
export const selectTheme = createSelector(selectSettings, settings => settings.theme);

export const selectLanguage = createSelector(selectSettings, settings => settings.language);
