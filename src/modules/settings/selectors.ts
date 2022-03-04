import {RootState} from '../../redux/configureStore';
import {createSelector} from '@reduxjs/toolkit';

const settingsState = (state: RootState) => state.settings;

export const languageSelector = createSelector(
  settingsState,
  settings => settings.language,
);
