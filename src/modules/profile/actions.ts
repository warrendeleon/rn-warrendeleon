import {createAsyncThunk} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';
import {Profile} from '@app/types';

import {getProfileService} from './api';

export const getProfile = createAsyncThunk<Profile, void, {state: RootState}>(
  'profile/getProfile',
  async (_, {rejectWithValue, getState}) => {
    try {
      const profile = await getProfileService(getState);
      return profile.data;
    } catch (error) {
      return rejectWithValue('API Error');
    }
  },
);
