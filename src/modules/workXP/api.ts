import {AxiosResponse} from 'axios';

import {apiClient} from '../../httpClient';
import {WorkXP} from '../../models/workXP';

export const getWorkXPService = async (): Promise<AxiosResponse<WorkXP[]>> => {
  return apiClient.get('workxp.json');
};
