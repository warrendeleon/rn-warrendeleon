import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { isE2EMockEnabled } from '@app/config/e2e';
import { GithubApiClient } from '@app/httpClients';
import { WorkExperienceSchema } from '@app/schemas';
import workxpCA from '@app/test-utils/fixtures/api/ca/workxp.json';
import workxpEN from '@app/test-utils/fixtures/api/en/workxp.json';
import workxpES from '@app/test-utils/fixtures/api/es/workxp.json';
import workxpPL from '@app/test-utils/fixtures/api/pl/workxp.json';
import workxpTL from '@app/test-utils/fixtures/api/tl/workxp.json';
import type { WorkExperience } from '@app/types/portfolio';

type MockedWorkExperience = WorkExperience & { mocked: boolean };

const workxpFixtures: Record<string, WorkExperience[]> = {
  en: workxpEN as WorkExperience[],
  es: workxpES as WorkExperience[],
  ca: workxpCA as WorkExperience[],
  pl: workxpPL as WorkExperience[],
  tl: workxpTL as WorkExperience[],
};

/**
 * Fetch work experience data from GitHub for a specific language
 *
 * Error Handling Strategy:
 * - Network errors (timeout, connection refused) propagate to caller
 * - HTTP errors (404, 500, etc.) propagate via Axios error with response details
 * - Errors are caught and handled in Redux async thunks
 * - Default error message provided when error.message is unavailable
 *
 * @param language - Language code (e.g., 'en', 'es', 'ca', 'pl', 'tl')
 * @returns Promise with work experience data array
 * @throws {AxiosError} When network request fails or HTTP error occurs
 */
export const fetchWorkExperienceData = async (
  language: string
): Promise<AxiosResponse<WorkExperience[]>> => {
  // E2E mocking: Return fixture data when E2E_MOCK=true
  if (isE2EMockEnabled) {
    const fixtureData = workxpFixtures[language] || workxpFixtures.en;
    const mockedData: MockedWorkExperience[] = (fixtureData as WorkExperience[]).map(item => ({
      ...item,
      mocked: true,
    }));

    return Promise.resolve({
      data: mockedData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
  }

  const response = await GithubApiClient.get<unknown>(`/${language}/workxp.json`);

  // Validate response data with Zod schema
  const validatedData = WorkExperienceSchema.parse(response.data);

  return {
    ...response,
    data: validatedData,
  };
};
