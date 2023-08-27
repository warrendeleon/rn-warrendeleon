import Redux from 'redux';

import {StatusState} from '@app/types';

export const NOT_STARTED = 'NOT_STARTED';
export const PENDING = 'PENDING';
export const REJECTED = 'REJECTED';
export const FULFILLED = 'FULFILLED';

const initialState: StatusState = {};

export const statusReducer = (
  state = initialState,
  action: Redux.AnyAction,
): StatusState => {
  const {type} = action;
  const matchesStart = /(.*)\/(pending)/.exec(type);
  const matchesError = /(.*)\/(rejected)/.exec(type);
  const matchesSuccess = /(.*)\/(fulfilled)/.exec(type);

  let status = NOT_STARTED;

  let key = null;

  if (matchesStart) {
    const [, requestName] = matchesStart;
    key = requestName;
    status = PENDING;
  } else if (matchesError) {
    const [, requestName] = matchesError;
    key = requestName;
    status = REJECTED;
    return {
      ...state,
      [key]: {
        ...action.payload,
        status,
      },
    };
  } else if (matchesSuccess) {
    const [, requestName] = matchesSuccess;
    key = requestName;
    status = FULFILLED;
  }
  if (key) {
    return {
      ...state,
      [key]: {
        status,
      },
    };
  }
  return state;
};
