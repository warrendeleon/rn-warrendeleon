import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';

const nandosState = (state: RootState) => state.nandos;

export const nandosSelector = createSelector(
  nandosState,
  restaurants => restaurants,
);
