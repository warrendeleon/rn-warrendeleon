import {combineReducers} from '@reduxjs/toolkit';

import {
  profileReducer,
  settingsReducer,
  statusReducer,
  videosReducer,
  workXPReducer,
} from '@app/modules';

export const rootReducer = combineReducers({
  profile: profileReducer,
  settings: settingsReducer,
  status: statusReducer,
  videos: videosReducer,
  workXP: workXPReducer,
});
