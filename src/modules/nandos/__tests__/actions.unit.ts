jest.mock('../api', () => ({
  getRestaurantsService: jest.fn().mockResolvedValue([]),
}));

import {getRestaurants} from '../actions';
import {getRestaurantsService} from '../api';

describe('getRestaurants', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getRestaurants', async () => {
    await getRestaurants()(dispatch, getState, {});
    expect(getRestaurantsService).toHaveBeenCalledTimes(1);
  });
});
