import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';

const educationState = (state: RootState) => state.education;

export const educationSelector = createSelector(
  educationState,
  education => education,
);
