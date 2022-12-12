jest.mock('../api', () => ({
  getPokedexService: jest.fn().mockResolvedValue([]),
}));

import {getInitialPokedexInfo} from '../actions';
import {getPokedexService} from '../api';

describe('getPokedex', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getPokedex', async () => {
    await getInitialPokedexInfo({offset: 0})(dispatch, getState, {});
    expect(getPokedexService).toHaveBeenCalledTimes(1);
  });
});
