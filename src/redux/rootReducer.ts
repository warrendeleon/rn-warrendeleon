import {combineReducers} from '@reduxjs/toolkit';

import {settingsReducer, statusReducer} from '@app/modules';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  status: statusReducer,
});
