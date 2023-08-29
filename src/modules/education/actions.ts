import {createAsyncThunk} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';
import {Education} from '@app/types';

import {getEducationService} from './api';

export const getEducation = createAsyncThunk<
  Education[],
  void,
  {state: RootState}
>('education/getEducation', async (_, {rejectWithValue, getState}) => {
  try {
    const education = await getEducationService(getState);
    return education.data;
  } catch (error) {
    return rejectWithValue('API Error');
  }
});
