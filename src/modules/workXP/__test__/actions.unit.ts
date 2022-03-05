jest.mock('../api', () => ({
  getWorkXPService: jest.fn().mockResolvedValue([]),
}));

import {getWorkXP} from '../actions';
import {getWorkXPService} from '../api';

describe('getRestaurants', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getRestaurants', async () => {
    await getWorkXP()(dispatch, getState, {});
    expect(getWorkXPService).toHaveBeenCalledTimes(1);
  });
});
