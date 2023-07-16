import {createReducer} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {setDarkMode, setLocale} from './actions';
import {Settings} from '@app/models';
import * as RNLocalize from 'react-native-localize';
import {Appearance} from 'react-native';

const initialState: Settings = {
  locale: RNLocalize.getLocales()[0].languageCode,
  darkMode: Appearance.getColorScheme() === 'dark',
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
