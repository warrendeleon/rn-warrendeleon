import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer, settingsReducer} from '@app/modules';

export const rootReducer = combineReducers({
  status: statusReducer,
  settings: settingsReducer,
});
