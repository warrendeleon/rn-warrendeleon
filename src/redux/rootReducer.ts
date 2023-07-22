import {combineReducers} from '@reduxjs/toolkit';

import {settingsReducer, statusReducer, videosReducer} from '@app/modules';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  status: statusReducer,
  videos: videosReducer,
});
