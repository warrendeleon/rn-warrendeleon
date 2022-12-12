import {Pokemon} from './Pokemon';

export interface Pokedex {
  count: number;
  currentCount: number;
  next?: string;
  previous?: string;
  results: PokedexEntry[];
  viewedPokemons: Pokemon[];
}

export interface PokedexEntry {
  name: string;
  url: string;
}
