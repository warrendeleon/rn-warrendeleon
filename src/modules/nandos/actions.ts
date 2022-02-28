import {createAsyncThunk} from '@reduxjs/toolkit';

import {getRestaurantsServuice} from './api';
import {Restaurants} from '../../models/nandosRestaurants';

export const getRestaurants = createAsyncThunk<Restaurants[]>(
  'nandos/getRestaurants',
  async (_, {rejectWithValue}) => {
    try {
      const restaurants = await getRestaurantsServuice();
      return restaurants.data.data.restaurant.items;
    } catch (error) {
      return rejectWithValue('API Error');
    }
  },
);
