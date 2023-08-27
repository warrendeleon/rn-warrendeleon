import {EmptyObject, Reducer} from 'redux';

import {createReducer} from '@reduxjs/toolkit';

import {WorkXP} from '@app/types';

import {getWorkXP} from './actions';

const initialState: WorkXP[] | EmptyObject = [];

export const workXPReducer: Reducer<WorkXP[] | []> = createReducer<
  WorkXP[] | []
>(initialState, builder => {
  builder.addCase(getWorkXP.fulfilled, (state, action) => action.payload);
});
