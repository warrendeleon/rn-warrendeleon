import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { isE2EMockEnabled } from '@app/config/e2e';
import { createE2EError, shouldEndpointFail } from '@app/config/e2e-error';
import { GithubApiClient } from '@app/httpClients';
import { EducationSchema } from '@app/schemas';
import educationCA from '@app/test-utils/fixtures/api/ca/education.json';
import educationEN from '@app/test-utils/fixtures/api/en/education.json';
import educationES from '@app/test-utils/fixtures/api/es/education.json';
import educationPL from '@app/test-utils/fixtures/api/pl/education.json';
import educationTL from '@app/test-utils/fixtures/api/tl/education.json';
import type { Education } from '@app/types/portfolio';

type MockedEducation = Education & { mocked: boolean };

const educationFixtures: Record<string, Education[]> = {
  en: educationEN as Education[],
  es: educationES as Education[],
  ca: educationCA as Education[],
  pl: educationPL as Education[],
  tl: educationTL as Education[],
};

/**
 * Fetch education data from GitHub for a specific language
 *
 * Error Handling Strategy:
 * - Network errors (timeout, connection refused) propagate to caller
 * - HTTP errors (404, 500, etc.) propagate via Axios error with response details
 * - Errors are caught and handled in Redux async thunks
 * - Default error message provided when error.message is unavailable
 * - E2E error simulation supported via launch arguments
 *
 * @param language - Language code (e.g., 'en', 'es', 'ca', 'pl', 'tl')
 * @returns Promise with education data array
 * @throws {AxiosError} When network request fails or HTTP error occurs
 * @throws {Error} When E2E error simulation is enabled
 */
export const fetchEducationData = async (language: string): Promise<AxiosResponse<Education[]>> => {
  // E2E mocking: Return fixture data when E2E_MOCK=true
  if (isE2EMockEnabled) {
    // Check if this endpoint should simulate an error
    if (shouldEndpointFail('education')) {
      const error = createE2EError();
      if (error) {
        return Promise.reject(error);
      }
    }

    // Return successful mock data
    const fixtureData = educationFixtures[language] || educationFixtures.en;
    const mockedData: MockedEducation[] = (fixtureData as Education[]).map(item => ({
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

  const response = await GithubApiClient.get<unknown>(`/${language}/education.json`);

  // Validate response data with Zod schema
  const validatedData = EducationSchema.parse(response.data);

  return {
    ...response,
    data: validatedData,
  };
};
