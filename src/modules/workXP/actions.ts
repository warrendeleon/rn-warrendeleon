import {createAsyncThunk} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';
import {WorkXP} from '@app/types';

import {getWorkXPService} from './api';

export const getWorkXP = createAsyncThunk<WorkXP[], void, {state: RootState}>(
  'workXP/getWorkXP',
  async (_, {rejectWithValue, getState}) => {
    try {
      const workXP = await getWorkXPService(getState);
      return workXP.data;
    } catch (error) {
      return rejectWithValue('API Error');
    }
  },
);
