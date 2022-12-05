import {createAsyncThunk} from '@reduxjs/toolkit';

import {getPatientsService} from './api';
import {Patient} from '../../models/Patient';
import {RootState} from '../../redux/configureStore';

export const getPatients = createAsyncThunk<
  Patient[],
  {clinicId: number},
  {state: RootState}
>('patients/getPatients', async (clinicId, {rejectWithValue}) => {
  try {
    console.log(clinicId)
    const patients = await getPatientsService(clinicId);
    return patients.data;
  } catch (error) {
    return rejectWithValue('API Error');
  }
});
