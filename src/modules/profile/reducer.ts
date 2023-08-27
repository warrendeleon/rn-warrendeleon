import {EmptyObject, Reducer} from 'redux';

import {createReducer} from '@reduxjs/toolkit';

import {Profile} from '@app/types';

import {getProfile} from './actions';

const initialState: Profile | EmptyObject = {};

export const profileReducer: Reducer<Profile | EmptyObject> = createReducer<
  Profile | EmptyObject
>(initialState, builder => {
  builder.addCase(getProfile.fulfilled, (state, action) => action.payload);
});
