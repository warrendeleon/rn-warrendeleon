import {createAsyncThunk} from '@reduxjs/toolkit';

import {getClinicsService} from './api';
import {Clinic} from '../../models/Clinic';
import {RootState} from '../../redux/configureStore';

export const getClinics = createAsyncThunk<Clinic[], void, {state: RootState}>(
  'clinics/getClinics',
  async (_, {rejectWithValue}) => {
    try {
      const clinics = await getClinicsService();
      return clinics.data;
    } catch (error) {
      return rejectWithValue('API Error');
    }
  },
);
