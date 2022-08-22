import MockAdapter from 'axios-mock-adapter';
import {mocked} from 'jest-mock';

import {apiClient} from '../../../httpClient';
import {getProfileService} from '../api';
import mockProfileResponse from '../../../data/en/profile.json';

jest.mock('../api', () => ({
  getProfileService: jest.fn(),
}));

const mockGetProfileService = mocked(getProfileService);

describe('getProfileService', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
    mockGetProfileService.mockReset();
  });

  describe('when API call is successful', () => {
    it('should return profile', async () => {
      mock.onGet('/en/profile.json').reply(200, mockProfileResponse);

      mockGetProfileService.mockImplementation(() => ({
        config: {},
        data: mockProfileResponse,
        headers: {},
        status: 200,
        statusText: 'OK',
      }));
      const result = await mockGetProfileService();

      expect(mockGetProfileService).toHaveBeenCalled();
      expect(mockGetProfileService).toHaveReturned();
      expect(result.data).toEqual(mockProfileResponse);
    });
  });

  describe('when API call fails', () => {
    it('should return undefined', async () => {
      mock.onGet('/en/profile.json').networkErrorOnce();

      const result = await mockGetProfileService();

      expect(mockGetProfileService).toHaveBeenCalled();
      expect(mockGetProfileService).toHaveReturned();
      expect(result).toBeUndefined();
    });
  });
});
