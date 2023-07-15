import {createReducer} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {setLocale} from './actions';
import {Settings} from '@app/models';
import * as RNLocalize from 'react-native-localize';

const initialState: Settings = {
  locale: RNLocalize.getLocales()[0].languageCode,
};

export const settingsReducer: Reducer<Settings> = createReducer<Settings>(
  initialState,
  builder => {
    builder.addCase(setLocale.fulfilled, (state, action) => ({
      ...state,
      locale: action.payload,
    }));
  },
);
