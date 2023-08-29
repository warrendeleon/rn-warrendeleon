import {combineReducers} from '@reduxjs/toolkit';

import {
  educationReducer,
  profileReducer,
  settingsReducer,
  statusReducer,
  videosReducer,
  workXPReducer,
} from '@app/modules';

export const rootReducer = combineReducers({
  education: educationReducer,
  profile: profileReducer,
  settings: settingsReducer,
  status: statusReducer,
  videos: videosReducer,
  workXP: workXPReducer,
});
