import MockAdapter from 'axios-mock-adapter';

import { GithubApiClient } from '@app/httpClients';
import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';

import { fetchProfileData } from '../api';

describe('Profile API', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(GithubApiClient);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('fetchProfileData', () => {
    it('should fetch profile data with correct locale', async () => {
      mock.onGet('/en/profile.json').reply(200, profileFixture);

      const response = await fetchProfileData('en');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(profileFixture);
    });

    it('should handle network errors', async () => {
      mock.onGet('/en/profile.json').networkError();

      await expect(fetchProfileData('en')).rejects.toThrow('Network Error');
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/en/profile.json').reply(404);

      await expect(fetchProfileData('en')).rejects.toThrow();
    });

    it('should construct URL correctly for different languages', async () => {
      mock.onGet('/es/profile.json').reply(200, profileFixture);

      const response = await fetchProfileData('es');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(profileFixture);
    });
  });
});
