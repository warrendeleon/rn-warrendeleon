import type { AxiosResponse } from 'axios';

import { GithubApiClient } from '@app/httpClients';
import type { Education } from '@app/types/portfolio';

/**
 * Fetch education data from GitHub for a specific language
 * @param language - Language code (e.g., 'en', 'es', 'ca', 'pl', 'tl')
 * @returns Promise with education data array
 */
export const fetchEducationData = async (language: string): Promise<AxiosResponse<Education[]>> => {
  return GithubApiClient.get<Education[]>(`/${language}/education.json`);
};
