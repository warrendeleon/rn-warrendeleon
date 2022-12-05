import {getClinics} from '../actions';
import {EmptyObject} from 'redux';
import {clinicsReducer} from '../reducer';
import mockClinics from '../../../data/en/clinics.json';
import {Clinic} from '../../../models/Clinic';

describe('clinics reducer', () => {
  test(`should put clinics in the state after dispatch ${getClinics.fulfilled}`, () => {
    const state: Clinic[] | EmptyObject = [];

    const action = {
      meta: {
        requestId: 'Hbqt3tV91Pod8AtkqXgYk',
        requestStatus: 'fulfilled',
      },
      payload: mockClinics,
      type: getClinics.fulfilled,
    };

    expect(clinicsReducer(state, action)).toStrictEqual(mockClinics);
  });
});
