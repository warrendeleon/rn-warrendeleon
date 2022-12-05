import {createReducer} from '@reduxjs/toolkit';
import {EmptyObject, Reducer} from 'redux';
import {getClinics} from './actions';
import {Clinic} from '../../models/Clinic';

const initialState: Clinic[] | EmptyObject = [];

export const clinicsReducer: Reducer<Clinic[] | []> = createReducer<
  Clinic[] | []
>(initialState, builder => {
  builder.addCase(getClinics.fulfilled, (state, action) => action.payload);
});
