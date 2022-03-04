import {createAsyncThunk} from '@reduxjs/toolkit';

import {getWorkXPService} from './api';
import {WorkXP} from '../../models/workXP';
import {RootState} from '../../redux/configureStore';

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
