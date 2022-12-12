export interface Pokemon {
  id: number;
  num: string;
  name: string;
  img: string;
  type: Type[];
  height: string;
  weight: string;
  candy: string;
  candy_count?: number;
  spawn_chance: number;
  avg_spawns: number;
  spawn_time: string;
  weaknesses: Type[];
  next_evolution?: Evolution[];
  prev_evolution?: Evolution[];
}

export interface Evolution {
  num: string;
  name: string;
}

export enum Type {
  Bug = 'Bug',
  Dark = 'Dark',
  Dragon = 'Dragon',
  Electric = 'Electric',
  Fairy = 'Fairy',
  Fighting = 'Fighting',
  Fire = 'Fire',
  Flying = 'Flying',
  Ghost = 'Ghost',
  Grass = 'Grass',
  Ground = 'Ground',
  Ice = 'Ice',
  Normal = 'Normal',
  Poison = 'Poison',
  Psychic = 'Psychic',
  Rock = 'Rock',
  Steel = 'Steel',
  Water = 'Water',
}
