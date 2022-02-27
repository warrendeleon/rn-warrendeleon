import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';

const workXPState = (state: RootState) => state.workXP;

export const workXPSelector = createSelector(workXPState, workXP => workXP);
