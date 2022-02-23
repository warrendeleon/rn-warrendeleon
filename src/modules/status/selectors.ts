import {createSelector} from "@reduxjs/toolkit";

import {RootState} from "../../redux/configStore";
import {FULFILLED, PENDING, REJECTED} from "./reducer";

export const statusSelector = (
  state: RootState,
  action: string,
): string | undefined => state.status[action]?.status;

export const isPendingSelector = createSelector(
  statusSelector,
  status => status === PENDING,
);
export const wasFulfilledSelector = createSelector(
  statusSelector,
  status => status === FULFILLED,
);
export const wasRejectedSelector = createSelector(
  statusSelector,
  status => status === REJECTED,
);
