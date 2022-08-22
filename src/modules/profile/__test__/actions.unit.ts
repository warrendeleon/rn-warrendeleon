jest.mock('../api', () => ({
  getProfileService: jest.fn().mockResolvedValue([]),
}));

import {getProfile} from '../actions';
import {getProfileService} from '../api';

describe('getProfile', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getProfile', async () => {
    await getProfile()(dispatch, getState, {});
    expect(getProfileService).toHaveBeenCalledTimes(1);
  });
});
