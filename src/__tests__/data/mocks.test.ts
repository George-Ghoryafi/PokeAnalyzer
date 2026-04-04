import { describe, it, expect } from 'vitest';
import { createEmptyStats, MOCK_POKEMON, MOCK_MOVES, MOCK_TYPE_WEAKNESSES } from '../../data/mocks';
import type { PokemonType } from '../../data/mocks';

describe('mocks data integrity', () => {
  describe('createEmptyStats', () => {
    it('creates all-zero stat spread', () => {
      const stats = createEmptyStats(0);
      expect(stats.hp).toBe(0);
      expect(stats.attack).toBe(0);
      expect(stats.defense).toBe(0);
      expect(stats.specialAttack).toBe(0);
      expect(stats.specialDefense).toBe(0);
      expect(stats.speed).toBe(0);
    });

    it('creates all-31 stat spread (max IVs)', () => {
      const stats = createEmptyStats(31);
      Object.values(stats).forEach(v => expect(v).toBe(31));
    });
  });

  describe('MOCK_POKEMON', () => {
    it('all have valid types', () => {
      const validTypes: PokemonType[] = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice',
        'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
        'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
      ];

      MOCK_POKEMON.forEach(p => {
        expect(p.types.length).toBeGreaterThanOrEqual(1);
        p.types.forEach(t => expect(validTypes).toContain(t));
      });
    });

    it('all have at least one ability', () => {
      MOCK_POKEMON.forEach(p => {
        expect(p.abilities.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('all have positive base stats', () => {
      MOCK_POKEMON.forEach(p => {
        Object.values(p.stats).forEach(v => expect(v).toBeGreaterThan(0));
      });
    });
  });

  describe('MOCK_MOVES', () => {
    it('all have valid categories', () => {
      const validCategories = ['physical', 'special', 'status'];
      Object.values(MOCK_MOVES).forEach(m => {
        expect(validCategories).toContain(m.category);
      });
    });

    it('all have valid types', () => {
      const validTypes: PokemonType[] = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice',
        'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
        'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
      ];
      Object.values(MOCK_MOVES).forEach(m => {
        expect(validTypes).toContain(m.type);
      });
    });
  });

  describe('MOCK_TYPE_WEAKNESSES', () => {
    it('covers all 18 types as keys', () => {
      const expectedTypes: PokemonType[] = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice',
        'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
        'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
      ];
      expectedTypes.forEach(t => {
        expect(MOCK_TYPE_WEAKNESSES[t]).toBeDefined();
      });
    });
  });
});
