import { describe, it, expect } from 'vitest';
import { calculateHP, calculateStat, getNatureModifier } from '../../lib/pokemonMath';
import type { Nature } from '../../data/mocks';

describe('pokemonMath', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // calculateHP
  // ══════════════════════════════════════════════════════════════════════════

  describe('calculateHP', () => {
    it('calculates standard HP at level 100 (Charizard, 31 IV, 252 EV)', () => {
      // Gen III+ formula: floor(((2*base + IV + floor(EV/4)) * level) / 100) + level + 10
      // = floor(((2*78 + 31 + 63) * 100) / 100) + 100 + 10
      // = floor(250) + 110 = 360
      // Wait — let's recompute carefully:
      // floor(EV/4) = floor(252/4) = 63
      // (2*78 + 31 + 63) = 250
      // (250 * 100) / 100 = 250
      // floor(250) + 100 + 10 = 360
      expect(calculateHP(78, 31, 252, 100)).toBe(360);
    });

    it('returns 1 for Shedinja regardless of EVs/IVs (base HP = 1)', () => {
      expect(calculateHP(1, 31, 252, 100)).toBe(1);
      expect(calculateHP(1, 0, 0, 50)).toBe(1);
      expect(calculateHP(1, 31, 0, 1)).toBe(1);
    });

    it('calculates HP at level 50', () => {
      // floor(((2*78 + 31 + 63) * 50) / 100) + 50 + 10
      // = floor(250 * 50 / 100) + 60 = floor(125) + 60 = 185
      expect(calculateHP(78, 31, 252, 50)).toBe(185);
    });

    it('calculates HP with zero EVs and zero IVs', () => {
      // floor(((2*78 + 0 + 0) * 100) / 100) + 100 + 10
      // = floor(156) + 110 = 266
      expect(calculateHP(78, 0, 0, 100)).toBe(266);
    });

    it('calculates HP at level 1', () => {
      // floor(((2*78 + 31 + 63) * 1) / 100) + 1 + 10
      // = floor(2.5) + 11 = 2 + 11 = 13
      expect(calculateHP(78, 31, 252, 1)).toBe(13);
    });

    it('calculates HP for a high-base Pokémon (Blissey, 255 base)', () => {
      // floor(((2*255 + 31 + 63) * 100) / 100) + 100 + 10
      // = 604 + 110 = 714
      expect(calculateHP(255, 31, 252, 100)).toBe(714);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // calculateStat
  // ══════════════════════════════════════════════════════════════════════════

  describe('calculateStat', () => {
    it('calculates with neutral nature (1.0 modifier)', () => {
      // withoutNature = floor(((2*100 + 31 + 63) * 100) / 100) + 5
      // = floor(294) + 5 = 299
      // final = floor(299 * 1.0) = 299
      expect(calculateStat(100, 31, 252, 100, 1.0)).toBe(299);
    });

    it('calculates with boosted nature (1.1 modifier)', () => {
      // floor(299 * 1.1) = floor(328.9) = 328
      expect(calculateStat(100, 31, 252, 100, 1.1)).toBe(328);
    });

    it('calculates with hindered nature (0.9 modifier)', () => {
      // floor(299 * 0.9) = floor(269.1) = 269
      expect(calculateStat(100, 31, 252, 100, 0.9)).toBe(269);
    });

    it('calculates at level 50', () => {
      // withoutNature = floor(((2*100 + 31 + 63) * 50) / 100) + 5
      // = floor(147) + 5 = 152
      expect(calculateStat(100, 31, 252, 50, 1.0)).toBe(152);
    });

    it('calculates with zero EVs and IVs', () => {
      // withoutNature = floor(((2*100 + 0 + 0) * 100) / 100) + 5
      // = floor(200) + 5 = 205
      expect(calculateStat(100, 0, 0, 100, 1.0)).toBe(205);
    });

    it('handles Speed stat for Charizard at level 50 with Jolly nature', () => {
      // base speed = 100, IV = 31, EV = 252, level = 50, +speed
      // withoutNature = floor(((200 + 31 + 63) * 50) / 100) + 5
      // = floor((294 * 50) / 100) + 5 = floor(147) + 5 = 152
      // final = floor(152 * 1.1) = floor(167.2) = 167
      expect(calculateStat(100, 31, 252, 50, 1.1)).toBe(167);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // getNatureModifier
  // ══════════════════════════════════════════════════════════════════════════

  describe('getNatureModifier', () => {
    const adamant: Nature = { name: 'Adamant', increasedStat: 'attack', decreasedStat: 'specialAttack' };
    const timid: Nature = { name: 'Timid', increasedStat: 'speed', decreasedStat: 'attack' };
    const hardy: Nature = { name: 'Hardy', increasedStat: null, decreasedStat: null };

    it('returns 1.1 for the boosted stat', () => {
      expect(getNatureModifier('attack', adamant)).toBe(1.1);
      expect(getNatureModifier('speed', timid)).toBe(1.1);
    });

    it('returns 0.9 for the reduced stat', () => {
      expect(getNatureModifier('specialAttack', adamant)).toBe(0.9);
      expect(getNatureModifier('attack', timid)).toBe(0.9);
    });

    it('returns 1.0 for unaffected stats', () => {
      expect(getNatureModifier('hp', adamant)).toBe(1.0);
      expect(getNatureModifier('defense', adamant)).toBe(1.0);
      expect(getNatureModifier('speed', adamant)).toBe(1.0);
    });

    it('returns 1.0 for null nature', () => {
      expect(getNatureModifier('attack', null)).toBe(1.0);
      expect(getNatureModifier('speed', null)).toBe(1.0);
    });

    it('returns 1.0 for neutral natures (Hardy, Docile, etc.)', () => {
      expect(getNatureModifier('attack', hardy)).toBe(1.0);
      expect(getNatureModifier('defense', hardy)).toBe(1.0);
      expect(getNatureModifier('speed', hardy)).toBe(1.0);
    });
  });
});
