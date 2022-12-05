import {getPatients} from '../actions';
import {EmptyObject} from 'redux';
import {patientsReducer} from '../reducer';
import mockPatients from '../../../data/en/patients.json';
import {Patient} from '../../../models/Patient';

describe('patients reducer', () => {
  test(`should put patients in the state after dispatch ${getPatients.fulfilled}`, () => {
    const state: Patient[] | EmptyObject = [];

    const action = {
      meta: {
        requestId: 'Hbqt3tV91Pod8AtkqXgYk',
        requestStatus: 'fulfilled',
      },
      payload: mockPatients,
      type: getPatients.fulfilled,
    };

    expect(patientsReducer(state, action)).toStrictEqual(mockPatients);
  });
});
