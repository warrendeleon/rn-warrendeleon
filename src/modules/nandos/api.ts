import {AxiosResponse} from 'axios';

import {nandoApiClient} from '../../httpClient';
import {NandosDTO} from '../../models/nandosRestaurants';

export const getRestaurantsService = async (): Promise<
  AxiosResponse<NandosDTO>
> => {
  return nandoApiClient.get('restaurantlist.json');
};
