/**
 * Coverage Analysis Engine — extracted from TeamCoverage.tsx for testability.
 * 
 * Performs the core computation that drives the Coverage tab:
 * - Defensive vulnerability analysis (dual-type multiplication)
 * - Offensive coverage mapping (which moves hit which types SE)
 * - Bucket classification (critical, mitigated, walled, etc.)
 */
import type { TeamSlotState, PokemonType, Move, Pokemon } from '../data/mocks';
import type { MatchupMatrix } from '../queries/typeQueries';
import { computeEffectiveTypes } from './utils';

export interface DefenderResult {
  pokemon: Pokemon;
  mult: number;
}

export interface AttackerResult {
  pokemon: Pokemon;
  moves: Move[];
}

export interface TypeAnalysis {
  type: PokemonType;
  defenders: DefenderResult[];
  attackers: AttackerResult[];
  maxDamageTaken: number;
  minDamageTaken: number;
  weakCount: number;
  isUnmitigatedWeakness: boolean;
  isStackedWeakness: boolean;
  isMitigatedWeakness: boolean;
  isWalled: boolean;
  isHeavilyResisted: boolean;
  isCovered: boolean;
}

export interface CoverageResult {
  analysis: TypeAnalysis[];
  criticalVulnerabilities: TypeAnalysis[];
  coreDefenses: TypeAnalysis[];
  offensiveCoverage: TypeAnalysis[];
  blindSpots: TypeAnalysis[];
}

/**
 * Computes a complete coverage analysis for the given team against the type matrix.
 * This is the **pure logic** extracted from the TeamCoverage component render.
 */
export function analyzeCoverage(team: TeamSlotState[], typeMatrix: MatchupMatrix): CoverageResult {
  const activeSlots = team.filter(s => s.pokemon !== null);
  const allTypes = Object.keys(typeMatrix) as PokemonType[];

  const analysis = allTypes.map(attackType => {
    // Who defends against this type?
    const defenders = activeSlots.map(slot => {
      const types = computeEffectiveTypes(slot);
      let mult = 1;
      // Multiply across ALL defender types to handle dual-typing correctly
      types.forEach(t => mult *= (typeMatrix[t]?.[attackType] ?? 1));
      return { pokemon: slot.pokemon!, mult };
    });

    // Who can attack this type for Super Effective damage? (Status moves excluded)
    const attackers = activeSlots.flatMap(slot => {
      const seMoves = slot.moves.filter(
        m => m && m.category !== 'status' && (typeMatrix[attackType]?.[m.type] ?? 1) > 1
      ) as Move[];
      if (seMoves.length > 0) return [{ pokemon: slot.pokemon!, moves: seMoves }];
      return [];
    });

    const maxDamageTaken = Math.max(...defenders.map(d => d.mult), 0);
    const minDamageTaken = Math.min(...defenders.map(d => d.mult), 1);
    const weakCount = defenders.filter(d => d.mult >= 2).length;

    // Contextual Rules
    const isUnmitigatedWeakness = maxDamageTaken >= 2 && minDamageTaken >= 1;
    const isStackedWeakness = weakCount >= 2;
    const isMitigatedWeakness = maxDamageTaken >= 2 && minDamageTaken < 1 && !isStackedWeakness;

    // Core Defenses
    const isWalled = minDamageTaken === 0;
    const isHeavilyResisted = minDamageTaken === 0.25 || minDamageTaken === 0.125;

    // Offense
    const isCovered = attackers.length > 0;

    return {
      type: attackType,
      defenders,
      attackers,
      maxDamageTaken,
      minDamageTaken,
      weakCount,
      isUnmitigatedWeakness,
      isStackedWeakness,
      isMitigatedWeakness,
      isWalled,
      isHeavilyResisted,
      isCovered,
    };
  });

  // Bucketing
  const criticalVulnerabilities = analysis
    .filter(t => t.isStackedWeakness)
    .sort((a, b) => b.weakCount - a.weakCount || b.maxDamageTaken - a.maxDamageTaken);

  const coreDefenses = analysis
    .filter(t => t.isWalled || t.isHeavilyResisted)
    .sort((a, b) => a.minDamageTaken - b.minDamageTaken);

  const offensiveCoverage = analysis
    .filter(t => t.isCovered)
    .sort((a, b) => b.attackers.length - a.attackers.length);

  const blindSpots = analysis.filter(t => !t.isCovered);

  return {
    analysis,
    criticalVulnerabilities,
    coreDefenses,
    offensiveCoverage,
    blindSpots,
  };
}
