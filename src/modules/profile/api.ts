import {AxiosResponse} from 'axios';

import {GithubApiClient} from '@app/httpClients';
import {RootState} from '@app/redux';
import {Profile} from '@app/types';

export const getProfileService = async (
  getState: () => RootState,
): Promise<AxiosResponse<Profile>> => {
  const {locale} = getState().settings;

  return GithubApiClient.get(`/${locale}/profile.json`);
};
