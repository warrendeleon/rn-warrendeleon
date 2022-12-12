import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../redux/configureStore';
import {POKEMON_URL} from '../../httpClient';
import { Pokemon } from "../../models/Pokemon";

const pokedexState = (state: RootState) => state.pokedex;

export const pokedexSelector = createSelector(pokedexState, pokedex => pokedex);

export const viewedPokemonsSelector = createSelector(
  pokedexSelector,
  pokedex => pokedex.viewedPokemons,
);

export const pokemonSelector = createSelector(
  viewedPokemonsSelector,
  (_: RootState, url: string) => url,
  (pokemons: Pokemon[], url: string) => {
    return pokemons?.find(pokemon => {
      const pokemonId = parseInt(
        url.replace(`${POKEMON_URL}/pokemon/`, '').replace('/', ''),
        10,
      );
      return pokemon.id === pokemonId;
    });
  },
);
