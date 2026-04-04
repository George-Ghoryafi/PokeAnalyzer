import { describe, it, expect } from 'vitest';
import { analyzeCoverage } from '../../lib/coverageAnalysis';
import { TYPE_MATRIX } from '../fixtures/typeMatrix';
import {
  createMockSlot, createMockPokemon, createBalancedTeam,
  CHARIZARD, GENGAR, SCIZOR, GASTRODON,
  FLAMETHROWER, STEALTH_ROCK, TOXIC,
} from '../fixtures/teamFixtures';

describe('coverageAnalysis — analyzeCoverage', () => {
  describe('defensive analysis', () => {
    it('Water/Ground takes 4x from Grass', () => {
      const team = [createMockSlot({ pokemon: GASTRODON }), ...Array(5).fill(null).map(() => createMockSlot())];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      const grass = result.analysis.find(a => a.type === 'grass')!;
      expect(grass.defenders[0].mult).toBe(4);
    });

    it('Ghost/Poison is immune to Normal and Fighting', () => {
      const team = [createMockSlot({ pokemon: GENGAR }), ...Array(5).fill(null).map(() => createMockSlot())];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      expect(result.analysis.find(a => a.type === 'normal')!.defenders[0].mult).toBe(0);
      expect(result.analysis.find(a => a.type === 'fighting')!.defenders[0].mult).toBe(0);
    });

    it('Bug/Steel: Poison is immune', () => {
      const team = [createMockSlot({ pokemon: SCIZOR }), ...Array(5).fill(null).map(() => createMockSlot())];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      expect(result.analysis.find(a => a.type === 'poison')!.defenders[0].mult).toBe(0);
    });

    it('detects stacked weakness (2 Fire types weak to Water)', () => {
      const team = [
        createMockSlot({ pokemon: CHARIZARD }),
        createMockSlot({ pokemon: createMockPokemon({ name: 'arcanine', types: ['fire'] }) }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      const water = result.analysis.find(a => a.type === 'water')!;
      expect(water.isStackedWeakness).toBe(true);
      expect(water.weakCount).toBe(2);
    });

    it('detects unmitigated weakness', () => {
      const team = [
        createMockSlot({ pokemon: createMockPokemon({ name: 'a', types: ['fire'] }) }),
        createMockSlot({ pokemon: createMockPokemon({ name: 'b', types: ['fire', 'fighting'] }) }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      expect(result.analysis.find(a => a.type === 'water')!.isUnmitigatedWeakness).toBe(true);
    });

    it('isWalled when any defender is immune', () => {
      const team = [createMockSlot({ pokemon: GENGAR }), ...Array(5).fill(null).map(() => createMockSlot())];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      expect(result.analysis.find(a => a.type === 'normal')!.isWalled).toBe(true);
      expect(result.coreDefenses.some(d => d.type === 'normal')).toBe(true);
    });

    it('isHeavilyResisted at 0.25x (Bug/Steel vs Grass)', () => {
      const team = [createMockSlot({ pokemon: SCIZOR }), ...Array(5).fill(null).map(() => createMockSlot())];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      const grass = result.analysis.find(a => a.type === 'grass')!;
      expect(grass.defenders[0].mult).toBe(0.25);
      expect(grass.isHeavilyResisted).toBe(true);
    });

    it('mitigated when someone resists', () => {
      const team = [
        createMockSlot({ pokemon: CHARIZARD }),
        createMockSlot({ pokemon: GASTRODON }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      const rock = result.analysis.find(a => a.type === 'rock')!;
      expect(rock.maxDamageTaken).toBe(4);
      expect(rock.minDamageTaken).toBeLessThan(1);
    });
  });

  describe('offensive analysis', () => {
    it('no moves → all blind spots', () => {
      const team = [createMockSlot({ pokemon: CHARIZARD }), ...Array(5).fill(null).map(() => createMockSlot())];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      expect(result.blindSpots.length).toBe(18);
    });

    it('Fire move covers Grass, Ice, Bug, Steel', () => {
      const team = [
        createMockSlot({ pokemon: CHARIZARD, moves: [FLAMETHROWER, null, null, null] }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      const covered = result.offensiveCoverage.map(c => c.type);
      expect(covered).toContain('grass');
      expect(covered).toContain('ice');
      expect(covered).toContain('bug');
      expect(covered).toContain('steel');
    });

    it('status moves excluded from coverage', () => {
      const team = [
        createMockSlot({ pokemon: CHARIZARD, moves: [TOXIC, STEALTH_ROCK, null, null] }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];
      const result = analyzeCoverage(team, TYPE_MATRIX);
      expect(result.offensiveCoverage.length).toBe(0);
    });
  });

  describe('sorting', () => {
    it('critical vulnerabilities sorted by weakCount desc', () => {
      const result = analyzeCoverage(createBalancedTeam(), TYPE_MATRIX);
      for (let i = 1; i < result.criticalVulnerabilities.length; i++) {
        expect(result.criticalVulnerabilities[i - 1].weakCount)
          .toBeGreaterThanOrEqual(result.criticalVulnerabilities[i].weakCount);
      }
    });

    it('core defenses sorted by minDamageTaken asc', () => {
      const result = analyzeCoverage(createBalancedTeam(), TYPE_MATRIX);
      for (let i = 1; i < result.coreDefenses.length; i++) {
        expect(result.coreDefenses[i - 1].minDamageTaken)
          .toBeLessThanOrEqual(result.coreDefenses[i].minDamageTaken);
      }
    });

    it('blind spots all have zero coverage', () => {
      const result = analyzeCoverage(createBalancedTeam(), TYPE_MATRIX);
      result.blindSpots.forEach(bs => {
        expect(bs.isCovered).toBe(false);
        expect(bs.attackers.length).toBe(0);
      });
    });
  });
});
