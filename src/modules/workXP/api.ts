import {AxiosResponse} from 'axios';

import {apiClient} from '../../httpClient';
import {WorkXP} from '../../models/workXP';
import {RootState} from '../../redux/configureStore';

export const getWorkXPService = async (
  getState: () => RootState,
): Promise<AxiosResponse<WorkXP[]>> => {
  const {language} = getState().settings;

  return apiClient.get(`/${language}/workxp.json`);
};
