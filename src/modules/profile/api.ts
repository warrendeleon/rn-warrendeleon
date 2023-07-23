import {AxiosResponse} from 'axios';

import {GithubApiClient} from '@app/httpClients';
import {Profile} from '@app/models';
import {RootState} from '@app/redux';

export const getProfileService = async (
  getState: () => RootState,
): Promise<AxiosResponse<Profile>> => {
  const {locale} = getState().settings;

  return GithubApiClient.get(`/${locale}/profile.json`);
};
