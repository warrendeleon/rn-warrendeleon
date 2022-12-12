import axios, {AxiosResponse} from 'axios';

import {pokemonApiClient} from '../../httpClient';
import {Pokedex} from '../../models/Pokedex';
import {Pokemon} from '../../models/Pokemon';

export const getPokedexService = async (): Promise<AxiosResponse<Pokedex>> => {
  return pokemonApiClient.get('/pokemon?limit=100&offset=0');
};

export const getPokemonInfoService = async ({
  url,
}: {
  url: string;
}): Promise<AxiosResponse<Pokemon | Pokedex>> => {
  return axios.get(url);
};
