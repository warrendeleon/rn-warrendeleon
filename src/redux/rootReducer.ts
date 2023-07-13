import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer} from '../modules/status/reducer';

export const rootReducer = combineReducers({
  status: statusReducer,
});
