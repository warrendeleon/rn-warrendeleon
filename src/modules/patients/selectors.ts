import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';
import {Patient} from '../../models/Patient';

const patientsState = (state: RootState) => state.patients;

export const patientsSelector = createSelector(
  patientsState,
  (patients: Patient[]) => patients,
);
