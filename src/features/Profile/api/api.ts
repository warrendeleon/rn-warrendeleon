import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { isE2EMockEnabled } from '@app/config/e2e';
import { GithubApiClient } from '@app/httpClients';
import profileCA from '@app/test-utils/fixtures/api/ca/profile.json';
import profileEN from '@app/test-utils/fixtures/api/en/profile.json';
import profileES from '@app/test-utils/fixtures/api/es/profile.json';
import profilePL from '@app/test-utils/fixtures/api/pl/profile.json';
import profileTL from '@app/test-utils/fixtures/api/tl/profile.json';
import type { Profile } from '@app/types/portfolio';

type MockedProfile = Profile & { mocked: boolean };

const profileFixtures: Record<string, Profile> = {
  en: profileEN as Profile,
  es: profileES as Profile,
  ca: profileCA as Profile,
  pl: profilePL as Profile,
  tl: profileTL as Profile,
};

/**
 * Fetch profile data from GitHub for a specific language
 *
 * Error Handling Strategy:
 * - Network errors (timeout, connection refused) propagate to caller
 * - HTTP errors (404, 500, etc.) propagate via Axios error with response details
 * - Errors are caught and handled in Redux async thunks
 * - Default error message provided when error.message is unavailable
 *
 * @param language - Language code (e.g., 'en', 'es', 'ca', 'pl', 'tl')
 * @returns Promise with profile data
 * @throws {AxiosError} When network request fails or HTTP error occurs
 */
export const fetchProfileData = async (language: string): Promise<AxiosResponse<Profile>> => {
  // E2E mocking: Return fixture data when E2E_MOCK=true
  if (isE2EMockEnabled) {
    const fixtureData = profileFixtures[language] || profileFixtures.en;
    const mockedData = {
      ...(fixtureData as Profile),
      mocked: true,
    } as MockedProfile;

    return Promise.resolve({
      data: mockedData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
  }

  return GithubApiClient.get<Profile>(`/${language}/profile.json`);
};
