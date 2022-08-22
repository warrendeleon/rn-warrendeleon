import {AxiosResponse} from 'axios';

import {apiClient} from '../../httpClient';
import {RootState} from '../../redux/configureStore';
import {Profile} from '../../models/Profile';

export const getProfileService = async (
  getState: () => RootState,
): Promise<AxiosResponse<Profile>> => {
  const {language} = getState().settings;

  return apiClient.get(`/${language}/profile.json`);
};
