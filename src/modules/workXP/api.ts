import {AxiosResponse} from 'axios';

import {GithubApiClient} from '@app/httpClients';
import {RootState} from '@app/redux';
import {WorkXP} from '@app/types';

export const getWorkXPService = async (
  getState: () => RootState,
): Promise<AxiosResponse<WorkXP[]>> => {
  const {locale} = getState().settings;

  return GithubApiClient.get(`/${locale}/workxp.json`);
};
