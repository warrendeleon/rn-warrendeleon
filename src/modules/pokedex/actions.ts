import {createAction, createAsyncThunk} from '@reduxjs/toolkit';

import {getPokedexService, getPokemonInfoService} from './api';
import {RootState} from '../../redux/configureStore';
import {Pokedex} from '../../models/Pokedex';
import {Pokemon} from '../../models/Pokemon';
import {AxiosResponse} from 'axios';

export const getInitialPokedexInfo = createAsyncThunk<
  Pokedex,
  void,
  {state: RootState}
>('pokedex/getInitialPokedexInfo', async (_, {rejectWithValue}) => {
  try {
    const pokedex = await getPokedexService();
    return pokedex.data;
  } catch (error) {
    return rejectWithValue('API Error');
  }
});

export const getPokedex = createAsyncThunk<
  Pokedex,
  {url: string},
  {state: RootState}
>('pokedex/getPokedex', async (props, {rejectWithValue}) => {
  try {
    const pokedex = (await getPokemonInfoService(
      props,
    )) as AxiosResponse<Pokedex>;
    return pokedex.data;
  } catch (error) {
    return rejectWithValue('API Error');
  }
});

export const getPokemonInfo = createAsyncThunk<
  Pokemon,
  {url: string},
  {state: RootState}
>('pokedex/getPokemonInfo', async (props, {rejectWithValue}) => {
  try {
    const pokemonInfo = (await getPokemonInfoService(
      props,
    )) as AxiosResponse<Pokemon>;
    return pokemonInfo.data;
  } catch (error) {
    return rejectWithValue('API Error');
  }
});

export const addPokemonToParty = createAction(
  'pokedex/addPokemonToParty',
  (pokemonName: string) => ({
    payload: pokemonName,
  }),
);

export const removePokemonFromParty = createAction(
  'pokedex/removePokemonFromParty',
  (pokemonName: string) => ({
    payload: pokemonName,
  }),
);
