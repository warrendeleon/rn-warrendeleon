import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';
import {Profile} from '@app/types';

const profileState = (state: RootState) => state.profile;

export const profileSelector = createSelector(
  profileState,
  profile => profile as Profile,
);
