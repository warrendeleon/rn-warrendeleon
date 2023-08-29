import {EmptyObject, Reducer} from 'redux';

import {createReducer} from '@reduxjs/toolkit';

import {Education} from '@app/types';

import {getEducation} from './actions';

const initialState: Education[] | EmptyObject = [];

export const educationReducer: Reducer<Education[] | []> = createReducer<
  Education[] | []
>(initialState, builder => {
  builder.addCase(getEducation.fulfilled, (state, action) => action.payload);
});
