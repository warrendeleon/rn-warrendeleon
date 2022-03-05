import {getWorkXP} from '../actions';
import {EmptyObject} from 'redux';
import {workXPReducer} from '../reducer';
import mockWorkXP from '../../../data/en/workxp.json';
import {WorkXP} from '../../../models/workXP';

describe('Nandos reducer', () => {
  test(`should put restaurants in the state after dispatch ${getWorkXP.fulfilled}`, () => {
    const state: WorkXP[] | EmptyObject = [];

    const action = {
      meta: {
        requestId: 'Hbqt3tV91Pod8AtkqXgYk',
        requestStatus: 'fulfilled',
      },
      payload: mockWorkXP,
      type: getWorkXP.fulfilled,
    };

    expect(workXPReducer(state, action)).toStrictEqual(mockWorkXP);
  });
});
