import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';
import {Clinic} from '../../models/Clinic';

const clinicsState = (state: RootState) => state.clinics;

export const clinicsSelector = createSelector(
  clinicsState,
  (clinics: Clinic[]) => clinics,
);
