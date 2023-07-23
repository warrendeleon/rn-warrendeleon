import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';

const videosState = (state: RootState) => state.videos;

export const videosSelector = createSelector(videosState, videos => videos);
