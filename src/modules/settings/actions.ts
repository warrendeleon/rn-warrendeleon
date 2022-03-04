import {createAsyncThunk} from '@reduxjs/toolkit';
import {changeLanguage} from '../../i18n/i18n.config';

export const setLanguage = createAsyncThunk<string, string>(
  'settings/changeLanguage',
  async (language, {rejectWithValue}) => {
    try {
      return new Promise<string>(resolve => {
        setTimeout(() => {
          resolve(changeLanguage(language).then(() => language));
        }, 500);
      });
    } catch (error) {
      return rejectWithValue('Error');
    }
  },
);
