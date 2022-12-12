import {createReducer} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {
  addPokemonToParty,
  getInitialPokedexInfo,
  getPokedex,
  getPokemonInfo,
  removePokemonFromParty,
} from './actions';
import {Pokedex} from '../../models/Pokedex';
import lodash from 'lodash';

const initialState: Pokedex = {
  currentCount: 0,
  count: 0,
  results: [],
  viewedPokemons: [],
};

export const pokedexReducer: Reducer<Pokedex> = createReducer<Pokedex>(
  initialState,
  builder => {
    builder
      .addCase(getInitialPokedexInfo.fulfilled, (state, action) => {
        const newResults = lodash.uniqBy(
          [...state.results, ...action.payload.results],
          'url',
        );
        return {
          ...state,
          ...action.payload,
          currentCount: newResults.length,
          results: newResults,
        };
      })
      .addCase(getPokedex.fulfilled, (state, action) => {
        const newResults = lodash.uniqBy(
          [...state.results, ...action.payload.results],
          'url',
        );
        return {
          ...state,
          ...action.payload,
          currentCount: newResults.length,
          results: newResults,
        };
      })
      .addCase(getPokemonInfo.fulfilled, (state, action) => {
        state.viewedPokemons = [...state.viewedPokemons, action.payload];
        return;
      })
      .addCase(addPokemonToParty, (state, action) => {
        const index = state.results.findIndex(
          pokemon => pokemon.name === action.payload,
        );

        if (index !== -1) {
          state.results[index] = {
            ...state.results[index],
            party: true,
          };
        }
        return;
      })
      .addCase(removePokemonFromParty, (state, action) => {
        const index = state.results.findIndex(
          pokemon => pokemon.name === action.payload,
        );

        if (index !== -1) {
          state.results[index] = {
            ...state.results[index],
            party: false,
          };
        }
        return;
      });
  },
);
