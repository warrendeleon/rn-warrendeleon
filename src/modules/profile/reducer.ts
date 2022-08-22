import {createReducer} from '@reduxjs/toolkit';
import {EmptyObject, Reducer} from 'redux';
import {getProfile} from './actions';
import {Profile} from '../../models/Profile';

const initialState: Profile | EmptyObject = {};

export const profileReducer: Reducer<Profile | EmptyObject> = createReducer<
  Profile | EmptyObject
>(initialState, builder => {
  builder.addCase(getProfile.fulfilled, (state, action) => action.payload);
});
