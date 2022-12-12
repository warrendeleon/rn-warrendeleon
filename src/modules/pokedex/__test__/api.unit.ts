import MockAdapter from 'axios-mock-adapter';
import {mocked} from 'jest-mock';

import {pokemonApiClient} from '../../../httpClient';
import {getPokedexService} from '../api';
import mockPokedexResponse from '../../../data/en/pokedex.json';

jest.mock('../api', () => ({
  getPokedexService: jest.fn(),
}));

const mockGetPokedexService = mocked(getPokedexService);

describe('getPokedexService', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(pokemonApiClient);
  });

  afterEach(() => {
    mock.reset();
    mockGetPokedexService.mockReset();
  });

  describe('when API call is successful', () => {
    it('should return pokedex', async () => {
      mock.onGet('/en/pokedex.json').reply(200, mockPokedexResponse);

      mockGetPokedexService.mockImplementation(() => ({
        config: {},
        data: mockPokedexResponse,
        headers: {},
        status: 200,
        statusText: 'OK',
      }));
      const result = await mockGetPokedexService();

      expect(mockGetPokedexService).toHaveBeenCalled();
      expect(mockGetPokedexService).toHaveReturned();
      expect(result.data).toEqual(mockPokedexResponse);
    });
  });

  describe('when API call fails', () => {
    it('should return undefined', async () => {
      mock.onGet('/en/pokedex.json').networkErrorOnce();

      const result = await mockGetPokedexService();

      expect(mockGetPokedexService).toHaveBeenCalled();
      expect(mockGetPokedexService).toHaveReturned();
      expect(result).toBeUndefined();
    });
  });
});
