import {RootState} from '../../redux/configureStore';
import {createSelector} from '@reduxjs/toolkit';

const settingsState = (state: RootState) => state.settings;

export const localeSelector = createSelector(
  settingsState,
  settings => settings.locale,
);

export const darkModeSelector = createSelector(
  settingsState,
  settings => settings.darkMode,
);
