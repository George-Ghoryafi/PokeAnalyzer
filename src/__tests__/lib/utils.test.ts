import { describe, it, expect } from 'vitest';
import { isPokemonAllowedInGame, computeEffectiveTypes } from '../../lib/utils';
import { createMockSlot, createMockItem, CHARIZARD, ARCEUS, SILVALLY } from '../fixtures/teamFixtures';
import type { PokemonType } from '../../data/mocks';

describe('utils', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // isPokemonAllowedInGame
  // ══════════════════════════════════════════════════════════════════════════

  describe('isPokemonAllowedInGame', () => {
    it('returns true when allowedSpecies is undefined', () => {
      expect(isPokemonAllowedInGame('charizard', undefined)).toBe(true);
    });

    it('returns true when allowedSpecies is empty', () => {
      expect(isPokemonAllowedInGame('charizard', [])).toBe(true);
    });

    it('returns true when pokemonName is null', () => {
      expect(isPokemonAllowedInGame(null, ['charizard'])).toBe(true);
    });

    it('returns true when pokemonName is undefined', () => {
      expect(isPokemonAllowedInGame(undefined, ['charizard'])).toBe(true);
    });

    it('returns true for a Pokémon in the allowed list', () => {
      expect(isPokemonAllowedInGame('charizard', ['charizard', 'pikachu'])).toBe(true);
    });

    it('returns false for a Pokémon NOT in the allowed list', () => {
      expect(isPokemonAllowedInGame('mewtwo', ['charizard', 'pikachu'])).toBe(false);
    });

    it('handles form names by progressively stripping hyphenated suffixes', () => {
      // charizard-mega-x → charizard-mega → charizard (found!)
      expect(isPokemonAllowedInGame('charizard-mega-x', ['charizard'])).toBe(true);
    });

    it('returns true when base species matches after single strip', () => {
      // charizard-gmax → charizard (found!)
      expect(isPokemonAllowedInGame('charizard-gmax', ['charizard'])).toBe(true);
    });

    it('returns false when no suffix-stripping matches', () => {
      expect(isPokemonAllowedInGame('mewtwo-mega-x', ['charizard'])).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // computeEffectiveTypes
  // ══════════════════════════════════════════════════════════════════════════

  describe('computeEffectiveTypes', () => {
    it('returns empty array when no Pokémon is set', () => {
      const slot = createMockSlot();
      expect(computeEffectiveTypes(slot)).toEqual([]);
    });

    it('returns intrinsic types for a normal Pokémon', () => {
      const slot = createMockSlot({ pokemon: CHARIZARD });
      expect(computeEffectiveTypes(slot)).toEqual(['fire', 'flying']);
    });

    it('Arceus with Flame Plate → fire type', () => {
      const slot = createMockSlot({
        pokemon: ARCEUS,
        item: createMockItem({ name: 'Flame Plate' }),
      });
      expect(computeEffectiveTypes(slot)).toEqual(['fire']);
    });

    it('Arceus with Draco Plate → dragon type', () => {
      const slot = createMockSlot({
        pokemon: ARCEUS,
        item: createMockItem({ name: 'Draco Plate' }),
      });
      expect(computeEffectiveTypes(slot)).toEqual(['dragon']);
    });

    it('Arceus with Pixie Plate → fairy type', () => {
      const slot = createMockSlot({
        pokemon: ARCEUS,
        item: createMockItem({ name: 'Pixie Plate' }),
      });
      expect(computeEffectiveTypes(slot)).toEqual(['fairy']);
    });

    it('Arceus without any plate → uses intrinsic types', () => {
      const slot = createMockSlot({
        pokemon: ARCEUS,
        item: createMockItem({ name: 'leftovers' }),
      });
      expect(computeEffectiveTypes(slot)).toEqual(['normal']);
    });

    it('Arceus with no item → uses intrinsic types', () => {
      const slot = createMockSlot({ pokemon: ARCEUS });
      expect(computeEffectiveTypes(slot)).toEqual(['normal']);
    });

    it('Silvally with Fire Memory → fire type', () => {
      const slot = createMockSlot({
        pokemon: SILVALLY,
        item: createMockItem({ name: 'Fire Memory' }),
      });
      expect(computeEffectiveTypes(slot)).toEqual(['fire']);
    });

    it('Silvally with Dragon Memory → dragon type', () => {
      const slot = createMockSlot({
        pokemon: SILVALLY,
        item: createMockItem({ name: 'Dragon Memory' }),
      });
      expect(computeEffectiveTypes(slot)).toEqual(['dragon']);
    });

    it('Silvally with no memory → uses intrinsic types', () => {
      const slot = createMockSlot({ pokemon: SILVALLY });
      expect(computeEffectiveTypes(slot)).toEqual(['normal']);
    });

    it('non-Arceus/Silvally Pokémon with a plate → types unchanged', () => {
      const slot = createMockSlot({
        pokemon: CHARIZARD,
        item: createMockItem({ name: 'Flame Plate' }),
      });
      // Charizard is NOT Arceus, so the plate doesn't change its types
      expect(computeEffectiveTypes(slot)).toEqual(['fire', 'flying']);
    });

    it('covers all plate type mappings', () => {
      const plateMappings: [string, PokemonType][] = [
        ['Draco Plate', 'dragon'], ['Dread Plate', 'dark'], ['Earth Plate', 'ground'],
        ['Fist Plate', 'fighting'], ['Flame Plate', 'fire'], ['Icicle Plate', 'ice'],
        ['Insect Plate', 'bug'], ['Iron Plate', 'steel'], ['Meadow Plate', 'grass'],
        ['Mind Plate', 'psychic'], ['Pixie Plate', 'fairy'], ['Sky Plate', 'flying'],
        ['Splash Plate', 'water'], ['Spooky Plate', 'ghost'], ['Stone Plate', 'rock'],
        ['Toxic Plate', 'poison'], ['Zap Plate', 'electric'], ['Blank Plate', 'normal'],
      ];

      plateMappings.forEach(([plateName, expectedType]) => {
        const slot = createMockSlot({
          pokemon: ARCEUS,
          item: createMockItem({ name: plateName }),
        });
        expect(computeEffectiveTypes(slot)).toEqual([expectedType]);
      });
    });
  });
});
