import type { Pokemon, PokemonType, Move, Item } from '../data/mocks';

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

export interface PokemonSpeciesResponse {
  varieties: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    }
  }[];
}

export const getPokemonSpeciesDetails = async (name: string, signal?: AbortSignal): Promise<PokemonSpeciesResponse> => {
  const response = await fetch(`${BASE_URL}/pokemon-species/${name.toLowerCase()}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch species details for ${name}`);
  return response.json();
};

export const getPokemonDetails = async (name: string, signal?: AbortSignal): Promise<Pokemon> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch details for ${name}`);
  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    speciesName: data.species.name,
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
    abilities: await Promise.all(data.abilities.map(async (a: any) => {
      try {
        const abilityRes = await fetch(a.ability.url, { signal });
        if (!abilityRes.ok) throw new Error();
        const abilityData = await abilityRes.json();
        
        // Find English flavor text, fallback to Japanese or empty
        const enEntry = abilityData.flavor_text_entries.find((e: any) => e.language.name === 'en');
        const description = enEntry ? enEntry.flavor_text.replace(/[\n\f]/g, ' ') : '';
        
        return {
          name: a.ability.name.replace('-', ' '),
          description,
          isHidden: Boolean(a.is_hidden)
        };
      } catch (e) {
        return {
          name: a.ability.name.replace('-', ' '),
          description: '',
          isHidden: Boolean(a.is_hidden)
        };
      }
    })).then(abilities => 
      abilities.concat(name.toLowerCase() === 'greninja' ? [{ 
        name: 'battle bond', 
        description: 'Defeating an opposing Pokémon boosts the Pokémon’s form.', 
        isHidden: true 
      }] : [])
    ),
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

export interface ItemListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export const getAllItems = async (signal?: AbortSignal): Promise<ItemListResponse> => {
  const response = await fetch(`${BASE_URL}/item?limit=2500`, { signal });
  if (!response.ok) throw new Error('Failed to fetch items list');
  return response.json();
};

const generationToGames: Record<string, string[]> = {
  'generation-i': ['red-blue', 'yellow'],
  'generation-ii': ['gold-silver', 'crystal'],
  'generation-iii': ['ruby-sapphire', 'emerald', 'firered-leafgreen', 'colosseum', 'xd'],
  'generation-iv': ['diamond-pearl', 'platinum', 'heartgold-soulsilver'],
  'generation-v': ['black-white', 'black-2-white-2'],
  'generation-vi': ['x-y', 'omega-ruby-alpha-sapphire'],
  'generation-vii': ['sun-moon', 'ultra-sun-ultra-moon', 'lets-go-pikachu-lets-go-eevee'],
  'generation-viii': ['sword-shield', 'the-isle-of-armor', 'the-crown-tundra', 'brilliant-diamond-shining-pearl', 'legends-arceus'],
  'generation-ix': ['scarlet-violet', 'the-teal-mask', 'the-indigo-disk']
};

export const getItemDetails = async (name: string, signal?: AbortSignal): Promise<Item> => {
  const response = await fetch(`${BASE_URL}/item/${name.toLowerCase().replace(/ /g, '-')}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch details for item ${name}`);
  const data = await response.json();

  const englishEntry = data.flavor_text_entries.find((f: any) => f.language.name === 'en');
  
  // PokeAPI's flavor texts are sparse (e.g., missing ORAS for old items).
  // We union flavor_text games with game_indices (generation appearances) to guarantee accurate legality.
  const flavorTextGames = data.flavor_text_entries
    .filter((f: any) => f.language.name === 'en' && f.version_group?.name)
    .map((f: any) => f.version_group.name);

  const generationGames = (data.game_indices || []).flatMap(
    (g: any) => generationToGames[g.generation?.name] || []
  );
  
  return {
    name: data.name.replace(/-/g, ' '),
    description: englishEntry ? englishEntry.text.replace(/\n|\f|\r/g, ' ') : '',
    spriteUrl: data.sprites?.default || '',
    category: data.category?.name || 'unknown',
    version_groups: Array.from(new Set<string>([...flavorTextGames, ...generationGames]))
  };
};
