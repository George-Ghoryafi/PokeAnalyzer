import { describe, it, expect } from 'vitest';
import { checkFormUnlocked } from '../../lib/formUnlock';
import {
  createMockSlot, createMockPokemon, createMockItem, createMockAbility,
  DRAGON_ASCENT,
} from '../fixtures/teamFixtures';

describe('formUnlock — checkFormUnlocked', () => {
  // ── Ash-Greninja: requires Battle Bond ability ──

  describe('greninja-ash', () => {
    it('unlocked when Battle Bond ability is set', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'greninja', types: ['water', 'dark'] }),
        ability: createMockAbility({ name: 'battle bond' }),
      });
      expect(checkFormUnlocked('greninja-ash', slot, 'national')).toBe(true);
    });

    it('locked when ability is NOT Battle Bond', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'greninja', types: ['water', 'dark'] }),
        ability: createMockAbility({ name: 'protean' }),
      });
      expect(checkFormUnlocked('greninja-ash', slot, 'national')).toBe(false);
    });

    it('locked when no ability is set', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'greninja', types: ['water', 'dark'] }),
        ability: null,
      });
      expect(checkFormUnlocked('greninja-ash', slot, 'national')).toBe(false);
    });
  });

  // ── Mega Rayquaza: requires Dragon Ascent move ──

  describe('rayquaza-mega', () => {
    it('unlocked when Dragon Ascent is equipped', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'rayquaza', types: ['dragon', 'flying'] }),
        moves: [DRAGON_ASCENT, null, null, null],
      });
      expect(checkFormUnlocked('rayquaza-mega', slot, 'national')).toBe(true);
    });

    it('locked without Dragon Ascent', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'rayquaza', types: ['dragon', 'flying'] }),
      });
      expect(checkFormUnlocked('rayquaza-mega', slot, 'national')).toBe(false);
    });
  });

  // ── Mega evolutions: require matching mega stone ──

  describe('mega forms', () => {
    it('charizard-mega is unlocked with charizardite', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
        item: createMockItem({ name: 'charizardite' }),
      });
      expect(checkFormUnlocked('charizard-mega', slot, 'national')).toBe(true);
    });

    it('charizard-mega-x requires item ending in ite x', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
        item: createMockItem({ name: 'charizardite x' }),
      });
      expect(checkFormUnlocked('charizard-mega-x', slot, 'national')).toBe(true);
    });

    it('charizard-mega-y requires item ending in ite y', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
        item: createMockItem({ name: 'charizardite y' }),
      });
      expect(checkFormUnlocked('charizard-mega-y', slot, 'national')).toBe(true);
    });

    it('mega form locked when no item is equipped', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
      });
      expect(checkFormUnlocked('charizard-mega', slot, 'national')).toBe(false);
    });
  });

  // ── Primal forms ──

  describe('primal forms', () => {
    it('groudon-primal requires Red Orb', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'groudon', types: ['ground'] }),
        item: createMockItem({ name: 'red orb' }),
      });
      expect(checkFormUnlocked('groudon-primal', slot, 'national')).toBe(true);
    });

    it('groudon-primal locked without Red Orb', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'groudon', types: ['ground'] }),
        item: createMockItem({ name: 'leftovers' }),
      });
      expect(checkFormUnlocked('groudon-primal', slot, 'national')).toBe(false);
    });

    it('kyogre-primal requires Blue Orb', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'kyogre', types: ['water'] }),
        item: createMockItem({ name: 'blue orb' }),
      });
      expect(checkFormUnlocked('kyogre-primal', slot, 'national')).toBe(true);
    });
  });

  // ── Zacian / Zamazenta ──

  describe('crowned forms', () => {
    it('zacian-crowned requires Rusted Sword', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'zacian', types: ['fairy'] }),
        item: createMockItem({ name: 'rusted sword' }),
      });
      expect(checkFormUnlocked('zacian-crowned', slot, 'national')).toBe(true);
    });

    it('zacian-crowned locked without Rusted Sword', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'zacian', types: ['fairy'] }),
        item: createMockItem({ name: 'leftovers' }),
      });
      expect(checkFormUnlocked('zacian-crowned', slot, 'national')).toBe(false);
    });

    it('zamazenta-crowned requires Rusted Shield', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'zamazenta', types: ['fighting'] }),
        item: createMockItem({ name: 'rusted shield' }),
      });
      expect(checkFormUnlocked('zamazenta-crowned', slot, 'national')).toBe(true);
    });
  });

  // ── G-Max ──

  describe('g-max forms', () => {
    it('available in sword-shield', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
      });
      expect(checkFormUnlocked('charizard-gmax', slot, 'sword-shield')).toBe(true);
    });

    it('available in national', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
      });
      expect(checkFormUnlocked('charizard-gmax', slot, 'national')).toBe(true);
    });

    it('unavailable in scarlet-violet', () => {
      const slot = createMockSlot({
        pokemon: createMockPokemon({ name: 'charizard', types: ['fire', 'flying'] }),
      });
      expect(checkFormUnlocked('charizard-gmax', slot, 'scarlet-violet')).toBe(false);
    });
  });

  // ── Default: unknown forms are unlocked ──

  it('unknown form defaults to true', () => {
    const slot = createMockSlot({
      pokemon: createMockPokemon({ name: 'rotom', types: ['electric', 'ghost'] }),
    });
    expect(checkFormUnlocked('rotom-wash', slot, 'national')).toBe(true);
  });
});
