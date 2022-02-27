import {createAsyncThunk} from '@reduxjs/toolkit';

import {getWorkXPService} from './api';
import {WorkXP} from '../../models/workXP';

export const getWorkXP = createAsyncThunk<WorkXP[]>(
  'workXP/getWorkXP',
  async (_, {rejectWithValue}) => {
    try {
      const workXP = await getWorkXPService();
      return workXP.data;
    } catch (error) {
      return rejectWithValue('API Error');
    }
  },
);
