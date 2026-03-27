import type { Pokemon, PokemonType, Move } from '../data/mocks';

const BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export interface VersionGroup {
  name: string;
  url: string;
}

export interface VersionGroupResponse {
  results: VersionGroup[];
}

export interface PokedexResponse {
  pokemon_entries: {
    pokemon_species: {
      name: string;
    }
  }[];
}

export interface VersionGroupDetails {
  pokedexes: {
    url: string;
  }[];
}

export const getAllPokemon = async (): Promise<PokemonListResponse> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=10000`);
  if (!response.ok) throw new Error('Failed to fetch pokemon list');
  return response.json();
};

export const getVersionGroups = async (signal?: AbortSignal): Promise<VersionGroupResponse> => {
  const response = await fetch(`${BASE_URL}/version-group?limit=100`, { signal });
  if (!response.ok) throw new Error('Failed to fetch version groups');
  return response.json();
};

export const getVersionGroupDetails = async (name: string, signal?: AbortSignal): Promise<VersionGroupDetails> => {
  const response = await fetch(`${BASE_URL}/version-group/${name}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch version group details for ${name}`);
  return response.json();
};

export const getPokedex = async (url: string, signal?: AbortSignal): Promise<PokedexResponse> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Failed to fetch pokedex');
  return response.json();
};

export const getPokemonDetails = async (name: string, signal?: AbortSignal): Promise<Pokemon> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch details for ${name}`);
  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t: any) => t.type.name as PokemonType),
    stats: {
      hp: data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 0,
      attack: data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
      defense: data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
      specialAttack: data.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 0,
      specialDefense: data.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 0,
      speed: data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0,
    },
    spriteUrl: data.sprites?.other?.['official-artwork']?.front_default 
      || data.sprites?.front_default 
      || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
    abilities: data.abilities.map((a: any) => ({
      name: a.ability.name.replace('-', ' '),
      description: ''
    })),
    learnset: [], 
    rawMoves: data.moves, // Pass raw moves directly to cache to allow localized UI filtering
    cries: data.cries ? {
      latest: data.cries.latest || '',
      legacy: data.cries.legacy || ''
    } : undefined
  };
};

export const getMoveDetails = async (name: string, signal?: AbortSignal): Promise<Move> => {
  const response = await fetch(`${BASE_URL}/move/${name.replace(/ /g, '-')}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch details for move ${name}`);
  const data = await response.json();

  const englishEntry = data.flavor_text_entries.find((f: any) => f.language.name === 'en');

  return {
    name: data.name.replace(/-/g, ' '),
    type: data.type.name as PokemonType,
    category: data.damage_class?.name as 'physical' | 'special' | 'status' || 'status',
    power: data.power,
    accuracy: data.accuracy,
    description: englishEntry ? englishEntry.flavor_text.replace(/\n|\f|\r/g, ' ') : '',
  };
};
