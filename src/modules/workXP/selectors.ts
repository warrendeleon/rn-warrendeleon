import {createSelector} from '@reduxjs/toolkit';

import {RootState} from '@app/redux';
import {WorkXP} from '@app/types';

const workXPState = (state: RootState) => state.workXP;

export const workXPSelector = createSelector(workXPState, workXP => workXP);

export const workXPDetailsSelector = createSelector(
  workXPSelector,
  (_: RootState, id: string) => id,
  (workXP, id: string) => {
    let res;
    res = workXP.find(work => work.id === id);

    if (!res) {
      workXP.map(work => {
        const r = work?.clients?.find(client => client.id === id);
        if (r) {
          res = r;
        }
      });
    }
    return res;
  },
);

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
      gradEnd: ['muted.200', 'muted.300'],
      gradStart: ['muted.500', 'muted.600'],
    };

    return {
      gradEnd: res?.gradEnd,
      gradStart: res?.gradStart,
    };
  },
);
