import {createReducer} from '@reduxjs/toolkit';
import {Reducer} from 'redux';
import {getInitialPokedexInfo, getPokedex, getPokemonInfo} from './actions';
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
          ...action.payload,
          currentCount: newResults.length,
          results: newResults,
        };
      })
      .addCase(getPokemonInfo.fulfilled, (state, action) => {
        if (state.viewedPokemons?.length > 0) {
          return {
            ...state,
            viewedPokemons: [...state.viewedPokemons, action.payload],
          };
        }
        return {
          ...state,
          viewedPokemons: [action.payload],
        };
      });
  },
);
