import {AxiosResponse} from 'axios';

import {nandoApiClient} from '../../httpClient';
import {NandosDTO} from '../../models/nandosRestaurants';

export const getRestaurantsServuice = async (): Promise<
  AxiosResponse<NandosDTO>
> => {
  return nandoApiClient.get('restaurantlist.json');
};
