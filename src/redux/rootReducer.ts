import {combineReducers} from '@reduxjs/toolkit';

import {statusReducer} from '@app/modules/status';

export const rootReducer = combineReducers({
  status: statusReducer,
});
