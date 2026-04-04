import { describe, it, expect } from 'vitest';
import { NATURES, STAT_SHORT_NAMES } from '../../data/natures';
import type { BaseStats } from '../../data/mocks';

describe('natures data', () => {
  it('contains all 25 natures', () => {
    expect(NATURES).toHaveLength(25);
  });

  it('has exactly 5 neutral natures with null increased/decreased stats', () => {
    const neutralNames = ['Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky'];
    const neutralNatures = NATURES.filter(n => n.increasedStat === null && n.decreasedStat === null);

    expect(neutralNatures).toHaveLength(5);
    neutralNatures.forEach(n => {
      expect(neutralNames).toContain(n.name);
    });
  });

  it('has 20 non-neutral natures with both non-null increased and decreased stats', () => {
    const nonNeutral = NATURES.filter(n => n.increasedStat !== null || n.decreasedStat !== null);
    expect(nonNeutral).toHaveLength(20);

    nonNeutral.forEach(n => {
      expect(n.increasedStat).not.toBeNull();
      expect(n.decreasedStat).not.toBeNull();
    });
  });

  it('no nature has the same stat for both increase and decrease', () => {
    NATURES.forEach(n => {
      if (n.increasedStat && n.decreasedStat) {
        expect(n.increasedStat).not.toEqual(n.decreasedStat);
      }
    });
  });

  it('all nature stat references are valid BaseStats keys', () => {
    const validKeys: (keyof BaseStats)[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

    NATURES.forEach(n => {
      if (n.increasedStat) {
        expect(validKeys).toContain(n.increasedStat);
      }
      if (n.decreasedStat) {
        expect(validKeys).toContain(n.decreasedStat);
      }
    });
  });

  it('nature names are unique (no duplicates)', () => {
    const names = NATURES.map(n => n.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('STAT_SHORT_NAMES maps all 6 stat keys', () => {
    const expectedKeys = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    expectedKeys.forEach(key => {
      expect(STAT_SHORT_NAMES[key]).toBeDefined();
      expect(typeof STAT_SHORT_NAMES[key]).toBe('string');
    });
  });

  it('STAT_SHORT_NAMES has correct abbreviations', () => {
    expect(STAT_SHORT_NAMES.hp).toBe('HP');
    expect(STAT_SHORT_NAMES.attack).toBe('Atk');
    expect(STAT_SHORT_NAMES.defense).toBe('Def');
    expect(STAT_SHORT_NAMES.specialAttack).toBe('SpA');
    expect(STAT_SHORT_NAMES.specialDefense).toBe('SpD');
    expect(STAT_SHORT_NAMES.speed).toBe('Spe');
  });
});
