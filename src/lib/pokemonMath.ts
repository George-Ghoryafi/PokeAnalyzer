import type { BaseStats, Nature } from '../data/mocks';

/**
 * Calculates the final Hit Points (HP) based on Generation III+ formulas.
 * Shedinja (HP Base 1) is hardcoded to always return 1.
 */
export function calculateHP(
  base: number,
  iv: number,
  ev: number,
  level: number
): number {
  if (base === 1) return 1; // Shedinja rule
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

/**
 * Calculates the final value for a non-HP stat based on Generation III+ formulas.
 */
export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureModifier: number // 1.1, 1.0, or 0.9
): number {
  const withoutNature = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(withoutNature * natureModifier);
}

/**
 * Derives the exact Nature modifier multiplier for a given stat.
 */
export function getNatureModifier(statKey: keyof BaseStats, nature: Nature | null): number {
  if (!nature) return 1.0;
  if (nature.increasedStat === statKey && nature.decreasedStat !== statKey) return 1.1;
  if (nature.decreasedStat === statKey && nature.increasedStat !== statKey) return 0.9;
  return 1.0;
}

/**
 * Derives the STAB multiplier for a given move, accounting for Terastallization.
 */
export function getStabMultiplier(
  slot: import('../data/mocks').TeamSlotState, 
  moveType: import('../data/mocks').PokemonType
): number {
  if (!slot.pokemon) return 1.0;
  
  if (slot.isTerastallized && slot.teraType) {
    if (moveType === slot.teraType) {
      if (slot.pokemon.types.includes(slot.teraType)) {
        return 2.0; // Double STAB
      }
      return 1.5; // New STAB
    }
    // Still keep original STAB when Terastallized
    if (slot.pokemon.types.includes(moveType)) return 1.5;
    return 1.0;
  }

  return slot.pokemon.types.includes(moveType) ? 1.5 : 1.0;
}
