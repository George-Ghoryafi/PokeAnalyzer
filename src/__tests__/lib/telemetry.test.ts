import { describe, it, expect } from 'vitest';
import { generateHeuristics, compileTeamTelemetry } from '../../lib/telemetry';
import { TYPE_MATRIX } from '../fixtures/typeMatrix';
import {
  createMockSlot, createMockPokemon, createMockAbility,
  createEmptyTeam, createMonoFireTeam,
  CHARIZARD, GENGAR, SCIZOR, GASTRODON,
  FLAMETHROWER,
  STEALTH_ROCK, RAPID_SPIN, DEFOG, SPIKES, TOXIC,
} from '../fixtures/teamFixtures';

describe('telemetry — generateHeuristics', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // Defense Analysis
  // ══════════════════════════════════════════════════════════════════════════

  describe('defense', () => {
    it('returns empty arrays for an empty team', () => {
      const h = generateHeuristics(createEmptyTeam(), TYPE_MATRIX);
      expect(h.defense.stackedWeaknesses).toEqual([]);
      expect(h.defense.unresistedThreats).toEqual([]);
    });

    it('detects stacked weaknesses for a mono-Fire team', () => {
      const team = createMonoFireTeam();
      const h = generateHeuristics(team, TYPE_MATRIX);

      // All 3 fire types are weak to Water, Ground, Rock
      expect(h.defense.stackedWeaknesses).toContain('water');
      expect(h.defense.stackedWeaknesses).toContain('ground');
      expect(h.defense.stackedWeaknesses).toContain('rock');
    });

    it('accounts for Levitate immunity to Ground', () => {
      const team = [
        createMockSlot({
          pokemon: createMockPokemon({ name: 'rotom-wash', types: ['electric', 'water'] }),
          ability: createMockAbility({ name: 'Levitate' }),
        }),
        createMockSlot({
          pokemon: createMockPokemon({ name: 'gengar', types: ['ghost', 'poison'] }),
          ability: createMockAbility({ name: 'Levitate' }),
        }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // Ground should NOT be in stacked weaknesses because both have Levitate
      expect(h.defense.stackedWeaknesses).not.toContain('ground');
    });

    it('accounts for Water Absorb immunity to Water', () => {
      const team = [
        createMockSlot({
          pokemon: createMockPokemon({ name: 'vaporeon', types: ['water'] }),
          ability: createMockAbility({ name: 'Water Absorb' }),
        }),
        createMockSlot({
          pokemon: CHARIZARD, // Fire is weak to Water
        }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // Only 1 member is weak to Water (Charizard), so it shouldn't be stacked (needs 2+)
      expect(h.defense.stackedWeaknesses).not.toContain('water');
    });

    it('detects unresisted threats', () => {
      // A single Normal-type has NO resistances except Ghost immunity (which isn't "resist")
      const team = [
        createMockSlot({
          pokemon: createMockPokemon({ name: 'snorlax', types: ['normal'] }),
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // Normal has 0 resistances (only Ghost immunity), so many types are unresisted
      // Fighting hits Snorlax SE, and Normal doesn't resist basically anything
      expect(h.defense.unresistedThreats.length).toBeGreaterThan(0);
    });

    it('adding Steel type covers many resistances', () => {
      const team = [
        createMockSlot({
          pokemon: SCIZOR, // Bug/Steel resists ~10 types
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // Steel resists many types, so unresisted threats should be relatively few
      expect(h.defense.unresistedThreats.length).toBeLessThan(10);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Offensive Analysis
  // ══════════════════════════════════════════════════════════════════════════

  describe('offense', () => {
    it('all types are uncovered when no moves are equipped', () => {
      const team = [
        createMockSlot({ pokemon: CHARIZARD }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.offense.uncoveredTypes.length).toBe(18);
    });

    it('equipping Flamethrower covers types weak to Fire', () => {
      const team = [
        createMockSlot({
          pokemon: CHARIZARD,
          moves: [FLAMETHROWER, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // Fire is SE against: Grass, Ice, Bug, Steel  
      expect(h.offense.uncoveredTypes).not.toContain('grass');
      expect(h.offense.uncoveredTypes).not.toContain('ice');
      expect(h.offense.uncoveredTypes).not.toContain('bug');
      expect(h.offense.uncoveredTypes).not.toContain('steel');
    });

    it('status moves are excluded from coverage calculation', () => {
      const team = [
        createMockSlot({
          pokemon: CHARIZARD,
          moves: [TOXIC, null, null, null], // Poison-type status move
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // Toxic is status → no coverage
      expect(h.offense.uncoveredTypes.length).toBe(18);
    });

    it('calculates balanced physical/special split correctly', () => {
      // Charizard: 84 Atk, 109 SpA
      // Gengar: 65 Atk, 130 SpA
      // Total: 149 Phys, 239 Spec → ~38% / ~62%
      const team = [
        createMockSlot({ pokemon: CHARIZARD }),
        createMockSlot({ pokemon: GENGAR }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.offense.physicalPercent).toBe(Math.round((149 / 388) * 100));
      expect(h.offense.specialPercent).toBe(Math.round((239 / 388) * 100));
    });

    it('all-physical team approaches 100% physical', () => {
      // Stack Pokémon with high Atk relative to SpA
      const physicalMon = createMockPokemon({
        name: 'machamp',
        types: ['fighting'],
        stats: { hp: 90, attack: 130, defense: 80, specialAttack: 10, specialDefense: 85, speed: 55 },
      });

      const team = [
        createMockSlot({ pokemon: physicalMon }),
        createMockSlot({ pokemon: physicalMon }),
        ...Array(4).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      // 260 Atk vs 20 SpA → 93% / 7%
      expect(h.offense.physicalPercent).toBeGreaterThan(90);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Utility Detection
  // ══════════════════════════════════════════════════════════════════════════

  describe('utility', () => {
    it('detects Stealth Rock as hazard', () => {
      const team = [
        createMockSlot({
          pokemon: GASTRODON,
          moves: [STEALTH_ROCK, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.utility.hasHazards).toBe(true);
    });

    it('detects Spikes as hazard', () => {
      const team = [
        createMockSlot({
          pokemon: GASTRODON,
          moves: [SPIKES, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.utility.hasHazards).toBe(true);
    });

    it('detects Rapid Spin as removal', () => {
      const team = [
        createMockSlot({
          pokemon: GASTRODON,
          moves: [RAPID_SPIN, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.utility.hasRemoval).toBe(true);
    });

    it('detects Defog as removal', () => {
      const team = [
        createMockSlot({
          pokemon: GASTRODON,
          moves: [DEFOG, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.utility.hasRemoval).toBe(true);
    });

    it('reports false when no hazard/removal moves are equipped', () => {
      const team = [
        createMockSlot({
          pokemon: CHARIZARD,
          moves: [FLAMETHROWER, null, null, null],
        }),
        ...Array(5).fill(null).map(() => createMockSlot()),
      ];

      const h = generateHeuristics(team, TYPE_MATRIX);
      expect(h.utility.hasHazards).toBe(false);
      expect(h.utility.hasRemoval).toBe(false);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// compileTeamTelemetry
// ══════════════════════════════════════════════════════════════════════════

describe('telemetry — compileTeamTelemetry', () => {
  it('returns empty message for an empty team', () => {
    const result = compileTeamTelemetry(createEmptyTeam());
    expect(result).toBe('The roster is currently empty.');
  });

  it('produces valid JSON for a team with a single Pokémon', () => {
    const team = [
      createMockSlot({ pokemon: CHARIZARD }),
      ...Array(5).fill(null).map(() => createMockSlot()),
    ];

    const result = compileTeamTelemetry(team);
    const parsed = JSON.parse(result);
    expect(parsed.teamSize).toBe(1);
    expect(parsed.members[0].species).toBe('charizard');
    expect(parsed.members[0].types).toEqual(['fire', 'flying']);
  });
});
