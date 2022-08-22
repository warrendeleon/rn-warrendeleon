import {createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';
import {Profile} from '../../models/Profile';
import {getProfileService} from './api';

export const getProfile = createAsyncThunk<Profile, void, {state: RootState}>(
  'Profile/getProfile',
  async (_, {rejectWithValue, getState}) => {
    try {
      const profile = await getProfileService(getState);
      return profile.data;
    } catch (error) {
      return rejectWithValue('API Error');
    }
  },
);
