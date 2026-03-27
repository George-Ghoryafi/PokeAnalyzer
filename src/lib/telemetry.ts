import type { TeamSlotState, PokemonType } from '../data/mocks';
import type { MatchupMatrix } from '../queries/typeQueries';

/**
 * Compresses the current team state into a highly dense telemetry string
 * designed to be fed directly into an LLM context window.
 * Ignores empty slots and stripping graphical properties (sprites, shininess)
 * in favor of pure competitive metadata.
 */
export function compileTeamTelemetry(team: TeamSlotState[]): string {
  const activeMembers = team.filter(slot => slot.pokemon !== null);
  
  if (activeMembers.length === 0) {
    return "The roster is currently empty.";
  }

  const telemetryData = activeMembers.map((slot, index) => {
    const p = slot.pokemon!;
    const equippedMoves = slot.moves.filter(m => m !== null).map(m => m!.name);
    
    return {
      slot: index + 1,
      species: p.name,
      types: p.types,
      item: slot.item?.name || 'none',
      ability: slot.ability?.name || 'none',
      level: slot.level,
      teraType: slot.teraType,
      stats: {
        hp: p.stats.hp,
        atk: p.stats.attack,
        def: p.stats.defense,
        spa: p.stats.specialAttack,
        spd: p.stats.specialDefense,
        spe: p.stats.speed
      },
      moves: equippedMoves
    };
  });

  return JSON.stringify({ 
    teamSize: activeMembers.length, 
    members: telemetryData 
  });
}

// ==========================================
// HEURISTIC ENGINE (0ms Algorithms)
// ==========================================

export interface TeamHeuristics {
  defense: {
    stackedWeaknesses: PokemonType[];
    unresistedThreats: PokemonType[];
  };
  offense: {
    uncoveredTypes: PokemonType[];
    physicalPercent: number;
    specialPercent: number;
  };
  utility: {
    hasHazards: boolean;
    hasRemoval: boolean;
  };
}

export function generateHeuristics(team: TeamSlotState[], typeMatrix: MatchupMatrix): TeamHeuristics {
  const h: TeamHeuristics = {
    defense: { stackedWeaknesses: [], unresistedThreats: [] },
    offense: { uncoveredTypes: [], physicalPercent: 50, specialPercent: 50 },
    utility: { hasHazards: false, hasRemoval: false }
  };

  const activeMembers = team.filter(t => t.pokemon !== null);
  if (activeMembers.length === 0 || Object.keys(typeMatrix).length === 0) return h;

  const typeWeaknessCount: Record<string, number> = {};
  const typeResistanceCount: Record<string, number> = {};
  const allTypes = Object.keys(typeMatrix) as PokemonType[];

  // Initialize
  allTypes.forEach(t => {
     typeWeaknessCount[t] = 0;
     typeResistanceCount[t] = 0;
  });

  // Calculate Resistances & Weaknesses
  activeMembers.forEach(slot => {
    const p = slot.pokemon!;
    allTypes.forEach(attackType => {
      let mult = 1;
      
      if (slot.teraType) {
        mult = typeMatrix[slot.teraType][attackType];
      } else {
        p.types.forEach(defType => {
          // Fallback to 1.0 multiplier if PokeAPI hasn't returned type definition yet
          const factor = typeMatrix[defType]?.[attackType];
          mult *= (factor !== undefined ? factor : 1.0);
        });
      }
      
      // Meta Ability Immunities
      if (slot.ability?.name === 'Levitate' && attackType === 'ground') mult = 0;
      if (slot.ability?.name === 'Water Absorb' && attackType === 'water') mult = 0;
      if (slot.ability?.name === 'Volt Absorb' && attackType === 'electric') mult = 0;
      if (slot.ability?.name === 'Flash Fire' && attackType === 'fire') mult = 0;
      if (slot.ability?.name === 'Sap Sipper' && attackType === 'grass') mult = 0;
      if (slot.ability?.name === 'Earth Eater' && attackType === 'ground') mult = 0;

      if (mult > 1) typeWeaknessCount[attackType]++;
      if (mult < 1) typeResistanceCount[attackType]++;
    });
  });

  allTypes.forEach(t => {
    if (typeWeaknessCount[t] >= 3) h.defense.stackedWeaknesses.push(t);
    if (typeResistanceCount[t] === 0) h.defense.unresistedThreats.push(t);
  });

  // Offensive Coverage Gaps
  const offensiveTypes = new Set<string>();
  activeMembers.forEach(slot => {
     slot.moves.forEach(m => {
       if (m && m.category !== 'status') offensiveTypes.add(m.type);
     });
  });
  
  allTypes.forEach(defType => {
     let canHitSE = false;
     offensiveTypes.forEach(atkType => {
        const factor = typeMatrix[defType]?.[atkType];
        if (factor && factor > 1) canHitSE = true;
     });
     if (!canHitSE) h.offense.uncoveredTypes.push(defType);
  });

  // Hazard Control
  activeMembers.forEach(slot => {
    slot.moves.forEach(m => {
      if (!m) return;
      if (['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'].includes(m.name)) h.utility.hasHazards = true;
      if (['Defog', 'Rapid Spin', 'Mortal Spin'].includes(m.name)) h.utility.hasRemoval = true;
    });
  });

  // Damage Imbalance
  let physAtk = 0;
  let specAtk = 0;
  activeMembers.forEach(slot => {
    physAtk += slot.pokemon!.stats.attack;
    specAtk += slot.pokemon!.stats.specialAttack;
  });
  const totalOffense = physAtk + specAtk;
  
  if (totalOffense > 0) {
    h.offense.physicalPercent = Math.round((physAtk / totalOffense) * 100);
    h.offense.specialPercent = Math.round((specAtk / totalOffense) * 100);
  }

  return h;
}
