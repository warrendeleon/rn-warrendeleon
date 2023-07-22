import {Reducer} from 'redux';

import {createReducer} from '@reduxjs/toolkit';

import {Video} from '@app/models/Video';

import {getVideos} from './actions';

const initialState: Video[] = [];

export const videosReducer: Reducer<Video[]> = createReducer<Video[]>(
  initialState,
  builder => {
    builder.addCase(getVideos.fulfilled, (state, action) => ({
      ...state,
      ...action.payload.items,
    }));
  },
);
