import type { AxiosResponse } from 'axios';

import { GithubApiClient } from '@app/httpClients';
import type { Profile } from '@app/types/portfolio';

/**
 * Fetch profile data from GitHub for a specific language
 * @param language - Language code (e.g., 'en', 'es', 'ca', 'pl', 'tl')
 * @returns Promise with profile data
 */
export const fetchProfileData = async (language: string): Promise<AxiosResponse<Profile>> => {
  return GithubApiClient.get<Profile>(`/${language}/profile.json`);
};
