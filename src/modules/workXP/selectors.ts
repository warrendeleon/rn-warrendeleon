import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';
import {WorkXP} from '../../models/workXP';

const workXPState = (state: RootState) => state.workXP;

export const workXPSelector = createSelector(workXPState, workXP => workXP);

export const clientsSelector = createSelector(
  workXPSelector,
  (_: RootState, id: string) => id,
  (workXP, id: string) => {
    const res = workXP.find(work => work.id === id);
    return res?.clients;
  },
);

export const colorsSelector = createSelector(
  workXPSelector,
  (_: RootState, id: string) => id,
  (workXP, id: string) => {
    const res: WorkXP | {gradStart: string[]; gradEnd: string[]} = workXP.find(
      work => work.id === id,
    ) ?? {
      gradStart: ['muted.500', 'muted.600'],
      gradEnd: ['muted.200', 'muted.300'],
    };

    return {
      gradStart: res?.gradStart,
      gradEnd: res?.gradEnd,
    };
  },
);
