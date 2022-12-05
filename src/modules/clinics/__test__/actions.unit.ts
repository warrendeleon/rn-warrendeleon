jest.mock('../api', () => ({
  getClinicsService: jest.fn().mockResolvedValue([]),
}));

import {getClinics} from '../actions';
import {getClinicsService} from '../api';

describe('getClinics', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getClinics', async () => {
    await getClinics()(dispatch, getState, {});
    expect(getClinicsService).toHaveBeenCalledTimes(1);
  });
});
