import MockAdapter from 'axios-mock-adapter';
import {mocked} from 'jest-mock';

import {apiClient} from '../../../httpClient';
import {getWorkXPService} from '../api';
import mockWorkXPResponse from '../../../data/en/workxp.json';

jest.mock('../api', () => ({
  getWorkXPService: jest.fn(),
}));

const mockGetWorkXPService = mocked(getWorkXPService);

describe('getWorkXPService', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
    mockGetWorkXPService.mockReset();
  });

  describe('when API call is successful', () => {
    it('should return menu', async () => {
      mock.onGet('/en/workxp.json').reply(200, mockWorkXPResponse);

      mockGetWorkXPService.mockImplementation(() =>({
        config: {},
        data: mockWorkXPResponse,
        headers: {},
        status: 200,
        statusText: 'OK',
      }));
      const result = await mockGetWorkXPService();

      expect(mockGetWorkXPService).toHaveBeenCalled();
      expect(mockGetWorkXPService).toHaveReturned();
      expect(result.data).toEqual(mockWorkXPResponse);
    });
  });

  describe('when API call fails', () => {
    it('should return undefined', async () => {
      mock.onGet('/en/workxp.json').networkErrorOnce();

      const result = await mockGetWorkXPService();

      expect(mockGetWorkXPService).toHaveBeenCalled();
      expect(mockGetWorkXPService).toHaveReturned();
      expect(result).toBeUndefined();
    });
  });
});
