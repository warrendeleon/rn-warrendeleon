import {Appearance} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import {Reducer} from 'redux';

import {createReducer} from '@reduxjs/toolkit';

import {Settings} from '@app/models';

import {setDarkMode, setLocale} from './actions';

const initialState: Settings = {
  darkMode: Appearance.getColorScheme() === 'dark',
  locale: RNLocalize.getLocales()[0].languageCode,
};

export const settingsReducer: Reducer<Settings> = createReducer<Settings>(
  initialState,
  builder => {
    builder
      .addCase(setLocale.fulfilled, (state, action) => ({
        ...state,
        locale: action.payload,
      }))
      .addCase(setDarkMode.fulfilled, (state, action) => ({
        ...state,
        darkMode: action.payload,
      }));
  },
);
