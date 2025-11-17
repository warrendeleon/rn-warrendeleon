/**
 * Tests for Profile API E2E mocking logic
 * Note: isE2EMockEnabled is determined by process.env.E2E_MOCK at build time
 * In unit tests (Jest), E2E_MOCK is not set, so isE2EMockEnabled = false
 * In E2E tests (Detox), E2E_MOCK=true is set, so isE2EMockEnabled = true
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { GithubApiClient } from '@app/httpClients';
import profileEN from '@app/test-utils/fixtures/api/en/profile.json';
import type { Profile } from '@app/types/portfolio';

import { fetchProfileData } from '../api';

// Type for mocked profile data (used when E2E_MOCK=true)
type MockedProfile = Profile & { mocked?: boolean };

// Mock GithubApiClient
jest.mock('@app/httpClients');

describe('Profile API - E2E Mocking Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Real API Path (Default in Unit Tests)', () => {
    // In unit tests, isE2EMockEnabled = false, so API calls GithubApiClient
    it('calls GithubApiClient.get with correct path for English', async () => {
      const mockResponse: AxiosResponse<Profile> = {
        data: profileEN as Profile,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchProfileData('en');

      expect(GithubApiClient.get).toHaveBeenCalledWith('/en/profile.json');
      expect(result.data).toEqual(profileEN);
    });

    it('calls GithubApiClient.get with correct path for Spanish', async () => {
      const mockResponse: AxiosResponse<Profile> = {
        data: profileEN as Profile,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await fetchProfileData('es');

      expect(GithubApiClient.get).toHaveBeenCalledWith('/es/profile.json');
    });

    it('calls GithubApiClient.get with correct path for other languages', async () => {
      const mockResponse: AxiosResponse<Profile> = {
        data: profileEN as Profile,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await fetchProfileData('ca');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/ca/profile.json');

      await fetchProfileData('pl');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/pl/profile.json');

      await fetchProfileData('tl');
      expect(GithubApiClient.get).toHaveBeenCalledWith('/tl/profile.json');
    });

    it('returns AxiosResponse with profile data', async () => {
      const mockResponse: AxiosResponse<Profile> = {
        data: profileEN as Profile,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchProfileData('en');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('status', 200);
      expect(result).toHaveProperty('statusText', 'OK');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('config');
    });

    it('returned profile data does not have mocked flag', async () => {
      const mockResponse: AxiosResponse<Profile> = {
        data: profileEN as Profile,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      (GithubApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchProfileData('en');

      // Real API data should not have 'mocked' property
      expect((result.data as MockedProfile).mocked).toBeUndefined();
    });
  });

  describe('Mocked Path (Active in E2E Tests)', () => {
    // The mocked path (isE2EMockEnabled = true) is tested during actual E2E tests
    // where E2E_MOCK=true is set in the environment
    it('fixture data is available for mocking', () => {
      // Verify fixture data exists and has correct structure
      expect(profileEN).toHaveProperty('name');
      expect(profileEN).toHaveProperty('lastName');
      expect(profileEN).toHaveProperty('email');
      expect(profileEN).toHaveProperty('phone');
      expect(profileEN).toHaveProperty('socials');
    });
  });
});
