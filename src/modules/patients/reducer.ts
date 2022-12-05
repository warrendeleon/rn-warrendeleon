import {createReducer} from '@reduxjs/toolkit';
import {EmptyObject, Reducer} from 'redux';
import {getPatients} from './actions';
import {Patient} from '../../models/Patient';

const initialState: Patient[] | EmptyObject = [];

export const patientsReducer: Reducer<Patient[] | []> = createReducer<
  Patient[] | []
>(initialState, builder => {
  builder.addCase(getPatients.fulfilled, (state, action) => action.payload);
});
