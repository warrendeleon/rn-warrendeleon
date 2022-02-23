import {createReducer} from '@reduxjs/toolkit';
import {EmptyObject, Reducer} from 'redux';
import {getWorkXP} from './actions';
import {WorkXP} from '../../models/workXP';

const initialState: WorkXP[] | EmptyObject = [];

export const workXPReducer: Reducer<WorkXP[] | []> = createReducer<
  WorkXP[] | []
>(initialState, builder => {
  builder.addCase(getWorkXP.fulfilled, (state, action) => action.payload);
});
