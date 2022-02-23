import {AxiosResponse} from 'axios';

import {apiClient} from '../../httpClient';
import {WorkXP} from '../../models/workXP';

export const getWorkXPService = async (): Promise<AxiosResponse<WorkXP[]>> => {
  console.log("HERE")
  return apiClient.get('workxp.json');
};
