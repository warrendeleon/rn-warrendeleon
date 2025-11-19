/**
 * Tests for WorkExperience API E2E mocking logic
 * Note: isE2EMockEnabled is determined by process.env.E2E_MOCK at build time
 * In unit tests (Jest), E2E_MOCK is not set, so isE2EMockEnabled = false
 * In E2E tests (Detox), E2E_MOCK=true is set, so isE2EMockEnabled = true
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { GithubApiClient } from '@app/httpClients';
import workxpEN from '@app/test-utils/fixtures/api/en/workxp.json';
import type { WorkExperience } from '@app/types/portfolio';

import { fetchWorkExperienceData } from '../api';

// Type for mocked work experience data (used when E2E_MOCK=true)
type MockedWorkExperience = WorkExperience & { mocked?: boolean };

// Mock GithubApiClient
jest.mock('@app/httpClients');

describe('WorkExperience API - E2E Mocking Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real API Path (Default in Unit Tests)', () => {
    // In unit tests, isE2EMockEnabled = false, so API calls GithubApiClient
    it('calls GithubApiClient.get with correct path for English', async () => {
      const mockResponse: AxiosResponse<WorkExperience[]> = {
        data: workxpEN as WorkExperience[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWorkExperienceData('en');

      expect(GithubApiClient.get).toHaveBeenCalledWith('/en/workxp.json');
      expect(result.data).toEqual(workxpEN);
    });

    it('calls GithubApiClient.get with correct path for Spanish', async () => {
      const mockResponse: AxiosResponse<WorkExperience[]> = {
        data: workxpEN as WorkExperience[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await fetchWorkExperienceData('es');

      expect(GithubApiClient.get).toHaveBeenCalledWith('/es/workxp.json');
    });

    it('calls GithubApiClient.get with correct path for other languages', async () => {
      const mockResponse: AxiosResponse<WorkExperience[]> = {
        data: workxpEN as WorkExperience[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await fetchWorkExperienceData('ca');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/ca/workxp.json');

      await fetchWorkExperienceData('pl');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/pl/workxp.json');

      await fetchWorkExperienceData('tl');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/tl/workxp.json');
    });

    it('returns AxiosResponse with work experience array data', async () => {
      const mockResponse: AxiosResponse<WorkExperience[]> = {
        data: workxpEN as WorkExperience[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWorkExperienceData('en');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('status', 200);
      expect(result).toHaveProperty('statusText', 'OK');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('config');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returned work experience data does not have mocked flag', async () => {
      const mockResponse: AxiosResponse<WorkExperience[]> = {
        data: workxpEN as WorkExperience[],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWorkExperienceData('en');

      // Real API data should not have 'mocked' property
      result.data.forEach(item => {
        expect((item as MockedWorkExperience).mocked).toBeUndefined();
      });
    });
  });

  describe('Mocked Path (Active in E2E Tests)', () => {
    // The mocked path (isE2EMockEnabled = true) is tested during actual E2E tests
    // where E2E_MOCK=true is set in the environment
    it('fixture data is available for mocking', () => {
      // Verify fixture data exists and has correct structure
      expect(Array.isArray(workxpEN)).toBe(true);
      expect(workxpEN.length).toBeGreaterThan(0);
      const firstItem = workxpEN[0]!;
      expect(firstItem).toHaveProperty('company');
      expect(firstItem).toHaveProperty('positions');
      expect(Array.isArray(firstItem.positions)).toBe(true);
      const firstPosition = firstItem.positions[0]!;
      expect(firstPosition).toHaveProperty('title');
      expect(firstPosition).toHaveProperty('start');
      expect(firstPosition).toHaveProperty('end');
    });
  });
});
