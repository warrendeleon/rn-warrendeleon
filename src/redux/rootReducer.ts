import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer} from '@app/modules/status';
import {settingsReducer} from '@app/modules/settings';

export const rootReducer = combineReducers({
  status: statusReducer,
  settings: settingsReducer,
});
