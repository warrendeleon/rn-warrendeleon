import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer} from '../modules/status/reducer';
import {workXPReducer} from '../modules/workXP/reducer';
import {nandosReducer} from '../modules/nandos/reducer';
import {settingsReducer} from '../modules/settings/reducer';

export const rootReducer = combineReducers({
  status: statusReducer,
  workXP: workXPReducer,
  nandos: nandosReducer,
  settings: settingsReducer,
});
