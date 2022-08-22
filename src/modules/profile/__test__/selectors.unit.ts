import mockProfile from '../../../data/en/profile.json';
import {RootState} from '../../../redux/configureStore';
import {profileSelector} from '../selectors';

describe('Profile selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      profile: mockProfile,
    } as RootState;
  });

  test('Get Profile selector', () => {
    expect(profileSelector(state)).toStrictEqual(mockProfile);
  });
});
