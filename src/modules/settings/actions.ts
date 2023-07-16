import {createAsyncThunk} from '@reduxjs/toolkit';
import {changeLanguage} from '@app/i18n/i18n.config';

export const setLocale = createAsyncThunk<string, string>(
  'settings/locale/setLocale',
  async (locale, {rejectWithValue}) => {
    try {
      return new Promise<string>(resolve => {
        setTimeout(() => {
          resolve(changeLanguage(locale).then(() => locale));
        }, 500);
      });
    } catch (error) {
      return rejectWithValue('Error');
    }
  },
);

export const setDarkMode = createAsyncThunk<boolean, boolean>(
  'settings/theme/setDarkMode',
  async (darkMode, {rejectWithValue}) => {
    try {
      return darkMode;
    } catch (error) {
      return rejectWithValue('Error');
    }
  },
);