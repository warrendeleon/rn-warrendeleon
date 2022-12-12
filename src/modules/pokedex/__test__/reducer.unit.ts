import {getInitialPokedexInfo} from '../actions';
import {pokedexReducer} from '../reducer';
import mockPokedex from '../../../data/en/pokedex.json';
import {Pokedex} from '../../../models/Pokedex';

describe('pokedex reducer', () => {
  test(`should put pokedex in the state after dispatch ${getInitialPokedexInfo.fulfilled}`, () => {
    const state: Pokedex = {
      currentCount: 0,
      count: 0,
      results: [],
      viewedPokemons: [],
    };

    const action = {
      meta: {
        requestId: 'Hbqt3tV91Pod8AtkqXgYk',
        requestStatus: 'fulfilled',
      },
      payload: mockPokedex,
      type: getInitialPokedexInfo.fulfilled,
    };

    expect(pokedexReducer(state, action)).toStrictEqual(mockPokedex);
  });
});
