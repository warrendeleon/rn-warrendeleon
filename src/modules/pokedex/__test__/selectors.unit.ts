import mockPokedex from '../../../data/en/pokedex.json';
import {RootState} from '../../../redux/configureStore';
import {pokedexSelector} from '../selectors';

describe('Pokedex selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      pokedex: mockPokedex,
    } as RootState;
  });

  test('Pokedex selector', () => {
    expect(pokedexSelector(state)).toStrictEqual(mockPokedex);
  });
});
