import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';

const profileState = (state: RootState) => state.profile;

export const profileSelector = createSelector(profileState, profile => profile);
