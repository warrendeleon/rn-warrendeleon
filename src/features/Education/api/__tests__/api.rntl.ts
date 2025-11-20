/**
 * Tests for Education API E2E mocking logic
 * Note: isE2EMockEnabled is determined by process.env.E2E_MOCK at build time
 * In unit tests (Jest), E2E_MOCK is not set, so isE2EMockEnabled = false
 * In E2E tests (Detox), E2E_MOCK=true is set, so isE2EMockEnabled = true
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { GithubApiClient } from '@app/httpClients';
import educationEN from '@app/test-utils/fixtures/api/en/education.json';
import type { Education } from '@app/types/portfolio';

import { fetchEducationData } from '../api';

// Type for mocked education data (used when E2E_MOCK=true)
type MockedEducation = Education & { mocked?: boolean };

// Mock GithubApiClient
jest.mock('@app/httpClients');

describe('Education API - E2E Mocking Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real API Path (Default in Unit Tests)', () => {
    // In unit tests, isE2EMockEnabled = false, so API calls GithubApiClient
    it('calls GithubApiClient.get with correct path for English', async () => {
      const mockResponse: AxiosResponse<Education[]> = {
        data: educationEN as Education[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchEducationData('en');

      expect(GithubApiClient.get).toHaveBeenCalledWith('/en/education.json');
      expect(result.data).toEqual(educationEN);
    });

    it('calls GithubApiClient.get with correct path for Spanish', async () => {
      const mockResponse: AxiosResponse<Education[]> = {
        data: educationEN as Education[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await fetchEducationData('es');

      expect(GithubApiClient.get).toHaveBeenCalledWith('/es/education.json');
    });

    it('calls GithubApiClient.get with correct path for other languages', async () => {
      const mockResponse: AxiosResponse<Education[]> = {
        data: educationEN as Education[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await fetchEducationData('ca');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/ca/education.json');

      await fetchEducationData('pl');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/pl/education.json');

      await fetchEducationData('tl');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/tl/education.json');
    });

    it('returns AxiosResponse with education array data', async () => {
      const mockResponse: AxiosResponse<Education[]> = {
        data: educationEN as Education[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchEducationData('en');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('status', 200);
      expect(result).toHaveProperty('statusText', 'OK');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('config');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returned education data does not have mocked flag', async () => {
      const mockResponse: AxiosResponse<Education[]> = {
        data: educationEN as Education[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchEducationData('en');

      // Real API data should not have 'mocked' property
      result.data.forEach(item => {
        expect((item as MockedEducation).mocked).toBeUndefined();
      });
    });
  });

  describe('Mocked Path (Active in E2E Tests)', () => {
    // The mocked path (isE2EMockEnabled = true) is tested during actual E2E tests
    // where E2E_MOCK=true is set in the environment
    it('fixture data is available for mocking', () => {
      // Verify fixture data exists and has correct structure
      expect(Array.isArray(educationEN)).toBe(true);
      expect(educationEN.length).toBeGreaterThan(0);
      expect(educationEN[0]).toHaveProperty('title');
      expect(educationEN[0]).toHaveProperty('institution');
      expect(educationEN[0]).toHaveProperty('startDate');
    });
  });
});
