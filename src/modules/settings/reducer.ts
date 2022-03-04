import {createReducer} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {setLanguage} from './actions';
import {Settings} from '../../models/Settings';
import * as RNLocalize from 'react-native-localize';

const initialState: Settings = {
  language: RNLocalize.getLocales()[0].languageCode,
};

export const settingsReducer: Reducer<Settings> = createReducer<Settings>(
  initialState,
  builder => {
    builder.addCase(setLanguage.fulfilled, (state, action) => ({
      ...state,
      language: action.payload,
    }));
  },
);
