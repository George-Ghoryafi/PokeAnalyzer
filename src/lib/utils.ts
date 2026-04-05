import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPokemonAllowedInGame(pokemonName: string | null | undefined, allowedSpecies: string[] | undefined): boolean {
  if (!pokemonName || !allowedSpecies || allowedSpecies.length === 0) return true;
  
  const speciesSet = new Set(allowedSpecies);
  let currentName = pokemonName;
  while (currentName) {
    if (speciesSet.has(currentName)) return true;
    const lastHyphen = currentName.lastIndexOf('-');
    if (lastHyphen === -1) break;
    currentName = currentName.substring(0, lastHyphen);
  }
  return false;
}

const ITEM_TYPE_MAP: Record<string, import('../data/mocks').PokemonType> = {
  'draco plate': 'dragon', 'dread plate': 'dark', 'earth plate': 'ground', 'fist plate': 'fighting',
  'flame plate': 'fire', 'icicle plate': 'ice', 'insect plate': 'bug', 'iron plate': 'steel',
  'meadow plate': 'grass', 'mind plate': 'psychic', 'pixie plate': 'fairy', 'sky plate': 'flying',
  'splash plate': 'water', 'spooky plate': 'ghost', 'stone plate': 'rock', 'toxic plate': 'poison',
  'zap plate': 'electric', 'blank plate': 'normal',
  'bug memory': 'bug', 'dark memory': 'dark', 'dragon memory': 'dragon', 'electric memory': 'electric',
  'fairy memory': 'fairy', 'fighting memory': 'fighting', 'fire memory': 'fire', 'flying memory': 'flying',
  'ghost memory': 'ghost', 'grass memory': 'grass', 'ground memory': 'ground', 'ice memory': 'ice',
  'poison memory': 'poison', 'psychic memory': 'psychic', 'rock memory': 'rock', 'steel memory': 'steel', 'water memory': 'water',
};

export function computeEffectiveTypes(slot: import('../data/mocks').TeamSlotState): import('../data/mocks').PokemonType[] {
  if (!slot.pokemon) return [];
  
  if (slot.isTerastallized && slot.teraType) {
    return [slot.teraType];
  }
  
  if (slot.pokemon.name === 'arceus' || slot.pokemon.name === 'silvally') {
    if (slot.item) {
      const override = ITEM_TYPE_MAP[slot.item.name.toLowerCase()];
      if (override) return [override];
    }
  }
  
  return slot.pokemon.types;
}

export function getEffectiveMoveType(slot: import('../data/mocks').TeamSlotState, move: import('../data/mocks').Move): import('../data/mocks').PokemonType {
  if (slot.isTerastallized && slot.teraType && move.name === 'Tera Blast') {
    return slot.teraType;
  }
  return move.type;
}

export const TYPE_TO_ID: Record<import('../data/mocks').PokemonType, number> = {
  normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6, bug: 7, ghost: 8, steel: 9, 
  fire: 10, water: 11, grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18, stellar: 19
};

export function getTypeIconUrl(type: import('../data/mocks').PokemonType): string {
  const id = TYPE_TO_ID[type];
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${id}.png`;
}

export function getSimpleTypeIconUrl(type: import('../data/mocks').PokemonType): string {
  if (type === 'stellar') return 'STELLAR';
  return `https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/${type}.svg`;
}
