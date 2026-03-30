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
  
  if (slot.pokemon.name === 'arceus' || slot.pokemon.name === 'silvally') {
    if (slot.item) {
      const override = ITEM_TYPE_MAP[slot.item.name.toLowerCase()];
      if (override) return [override];
    }
  }
  
  return slot.pokemon.types;
}
