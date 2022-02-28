import {createReducer} from '@reduxjs/toolkit';
import {EmptyObject, Reducer} from 'redux';
import {getRestaurants} from './actions';
import {Restaurants} from '../../models/nandosRestaurants';

const initialState: Restaurants[] | EmptyObject = [];

export const nandosReducer: Reducer<Restaurants[] | []> = createReducer<
  Restaurants[] | []
>(initialState, builder => {
  builder.addCase(getRestaurants.fulfilled, (state, action) => action.payload);
});
