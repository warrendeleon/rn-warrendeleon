import MockAdapter from 'axios-mock-adapter';

import { GithubApiClient } from '@app/httpClients';
import educationFixture from '@app/test-utils/fixtures/api/en/education.json';

import { fetchEducationData } from '../api';

describe('Education API', () => {
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

  describe('fetchEducationData', () => {
    it('should fetch education data with correct locale', async () => {
      mock.onGet('/en/education.json').reply(200, educationFixture);

      const response = await fetchEducationData('en');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(educationFixture);
    });

    it('should handle network errors', async () => {
      mock.onGet('/en/education.json').networkError();

      await expect(fetchEducationData('en')).rejects.toThrow('Network Error');
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/en/education.json').reply(404);

      await expect(fetchEducationData('en')).rejects.toThrow();
    });

    it('should construct URL correctly for different languages', async () => {
      mock.onGet('/es/education.json').reply(200, educationFixture);

      const response = await fetchEducationData('es');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(educationFixture);
    });
  });
});
