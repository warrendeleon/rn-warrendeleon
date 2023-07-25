import {createSelector} from '@reduxjs/toolkit';

import {Profile} from '@app/models';
import {RootState} from '@app/redux';

const profileState = (state: RootState) => state.profile;

export const profileSelector = createSelector(
  profileState,
  profile => profile as Profile,
);
