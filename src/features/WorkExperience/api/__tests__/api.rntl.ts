import MockAdapter from 'axios-mock-adapter';

import { GithubApiClient } from '@app/httpClients';
import workExperienceFixture from '@app/test-utils/fixtures/api/en/workxp.json';

import { fetchWorkExperienceData } from '../api';

describe('WorkExperience API', () => {
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

  describe('fetchWorkExperienceData', () => {
    it('should fetch work experience data with correct locale', async () => {
      mock.onGet('/en/workxp.json').reply(200, workExperienceFixture);

      const response = await fetchWorkExperienceData('en');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(workExperienceFixture);
    });

    it('should handle network errors', async () => {
      mock.onGet('/en/workxp.json').networkError();

      await expect(fetchWorkExperienceData('en')).rejects.toThrow('Network Error');
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/en/workxp.json').reply(404);

      await expect(fetchWorkExperienceData('en')).rejects.toThrow();
    });

    it('should construct URL correctly for different languages', async () => {
      mock.onGet('/es/workxp.json').reply(200, workExperienceFixture);

      const response = await fetchWorkExperienceData('es');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(workExperienceFixture);
    });
  });
});
