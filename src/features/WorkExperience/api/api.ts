import type { AxiosResponse } from 'axios';

import { GithubApiClient } from '@app/httpClients';
import type { WorkExperience } from '@app/types/portfolio';

/**
 * Fetch work experience data from GitHub for a specific language
 * @param language - Language code (e.g., 'en', 'es', 'ca', 'pl', 'tl')
 * @returns Promise with work experience data array
 */
export const fetchWorkExperienceData = async (
  language: string
): Promise<AxiosResponse<WorkExperience[]>> => {
  return GithubApiClient.get<WorkExperience[]>(`/${language}/workxp.json`);
};
