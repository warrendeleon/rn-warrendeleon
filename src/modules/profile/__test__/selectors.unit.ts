import {RootState} from '@app/redux';

import mockProfile from '../../../data/en/profile.json';
import {profileSelector} from '../selectors';

describe('Profile selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      profile: mockProfile,
    } as RootState;
  });

  test('Profile selector', () => {
    expect(profileSelector(state)).toStrictEqual(mockProfile);
  });
});
