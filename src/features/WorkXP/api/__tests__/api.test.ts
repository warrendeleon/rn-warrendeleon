import MockAdapter from 'axios-mock-adapter';

import { GithubApiClient } from '@app/httpClients';
import workxpFixture from '@app/test-utils/fixtures/api/en/workxp.json';

import { fetchWorkXPData } from '../api';

describe('WorkXP API', () => {
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

  describe('fetchWorkXPData', () => {
    it('should fetch work experience data with correct locale', async () => {
      mock.onGet('/en/workxp.json').reply(200, workxpFixture);

      const response = await fetchWorkXPData('en');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(workxpFixture);
    });

    it('should handle network errors', async () => {
      mock.onGet('/en/workxp.json').networkError();

      await expect(fetchWorkXPData('en')).rejects.toThrow('Network Error');
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/en/workxp.json').reply(404);

      await expect(fetchWorkXPData('en')).rejects.toThrow();
    });

    it('should construct URL correctly for different languages', async () => {
      mock.onGet('/es/workxp.json').reply(200, workxpFixture);

      const response = await fetchWorkXPData('es');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(workxpFixture);
    });
  });
});
