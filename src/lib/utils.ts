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
