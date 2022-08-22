import {getProfile} from '../actions';
import {EmptyObject} from 'redux';
import {profileReducer} from '../reducer';
import mockProfile from '../../../data/en/profile.json';
import {Profile} from '../../../models/Profile';

describe('Profile reducer', () => {
  test(`should put profile in the state after dispatch ${getProfile.fulfilled}`, () => {
    const state: Profile | EmptyObject = {};

    const action = {
      meta: {
        requestId: 'Hbqt3tV91Pod8AtkqXgYk',
        requestStatus: 'fulfilled',
      },
      payload: mockProfile,
      type: getProfile.fulfilled,
    };

    expect(profileReducer(state, action)).toStrictEqual(mockProfile);
  });
});
