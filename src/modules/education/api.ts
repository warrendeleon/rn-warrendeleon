import {AxiosResponse} from 'axios';

import {GithubApiClient} from '@app/httpClients';
import {RootState} from '@app/redux';
import {Education} from '@app/types';

export const getEducationService = async (
  getState: () => RootState,
): Promise<AxiosResponse<Education[]>> => {
  const {locale} = getState().settings;

  return GithubApiClient.get(`/${locale}/education.json`);
};
