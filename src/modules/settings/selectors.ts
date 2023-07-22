import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '../../redux/configureStore';

const settingsState = (state: RootState) => state.settings;

export const localeSelector = createSelector(
  settingsState,
  settings => settings.locale,
);

export const darkModeSelector = createSelector(
  settingsState,
  settings => settings.darkMode,
);
