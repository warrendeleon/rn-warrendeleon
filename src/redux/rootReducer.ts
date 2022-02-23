import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer} from '../modules/status/reducer';
import {workXPReducer} from '../modules/workXP/reducer';

export const rootReducer = combineReducers({
  status: statusReducer,
  workXP: workXPReducer,
});
