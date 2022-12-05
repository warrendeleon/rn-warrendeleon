import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';
import {Patient} from '../../models/Patient';
import lodash from 'lodash';

const patientsState = (state: RootState) => state.patients;

export const patientsSelector = createSelector(
  patientsState,
  (patients: Patient[]) => patients,
);

export const patientFilteredSelector = createSelector(
  patientsSelector,
  (_: RootState, filterBy: string) => filterBy,
  (patients, filterBy: string) => {
    return lodash.sortBy(patients, [filterBy]);
  },
);
