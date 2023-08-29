import {EmptyObject} from 'redux';

import {getProfile, profileReducer} from '@app/modules';
import {Profile} from '@app/types';

import mockProfile from '../../../data/en/profile.json';

describe('Profile reducer', () => {
  test(`should put Profile in the state after dispatch ${getProfile.fulfilled}`, () => {
    const state: Profile | EmptyObject = {};

    const action = {
      meta: {
        requestId: 'BM_7omwZ-dB20XGcVfMHP',
        requestStatus: 'fulfilled',
      },
      payload: mockProfile,
      type: getProfile.fulfilled,
    };

    expect(profileReducer(state, action)).toStrictEqual(mockProfile);
  });
});
