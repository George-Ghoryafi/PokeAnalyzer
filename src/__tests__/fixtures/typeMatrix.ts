/**
 * Complete 18×18 type matchup matrix for offline testing.
 * Format: matrix[DefenderType][AttackerType] = multiplier
 * 
 * This is the **real** Pokémon type chart — not approximations.
 * We use it so tests don't depend on PokeAPI network calls.
 */
import type { MatchupMatrix } from '../../queries/typeQueries';

const ALL_TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
  'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
] as const;

function buildMatrix(): MatchupMatrix {
  const m: MatchupMatrix = {};

  // Initialize everything to 1.0 (neutral)
  ALL_TYPES.forEach(def => {
    m[def] = {};
    ALL_TYPES.forEach(atk => {
      m[def][atk] = 1.0;
    });
  });

  // Helper: set a multiplier
  const set = (defender: string, attacker: string, mult: number) => {
    m[defender][attacker] = mult;
  };

  // ── Normal ──
  set('normal', 'fighting', 2);
  set('normal', 'ghost', 0);

  // ── Fighting ──
  set('fighting', 'flying', 2);
  set('fighting', 'psychic', 2);
  set('fighting', 'fairy', 2);
  set('fighting', 'rock', 0.5);
  set('fighting', 'bug', 0.5);
  set('fighting', 'dark', 0.5);

  // ── Flying ──
  set('flying', 'electric', 2);
  set('flying', 'ice', 2);
  set('flying', 'rock', 2);
  set('flying', 'fighting', 0.5);
  set('flying', 'bug', 0.5);
  set('flying', 'grass', 0.5);
  set('flying', 'ground', 0);

  // ── Poison ──
  set('poison', 'ground', 2);
  set('poison', 'psychic', 2);
  set('poison', 'fighting', 0.5);
  set('poison', 'poison', 0.5);
  set('poison', 'bug', 0.5);
  set('poison', 'grass', 0.5);
  set('poison', 'fairy', 0.5);

  // ── Ground ──
  set('ground', 'water', 2);
  set('ground', 'grass', 2);
  set('ground', 'ice', 2);
  set('ground', 'poison', 0.5);
  set('ground', 'rock', 0.5);
  set('ground', 'electric', 0);

  // ── Rock ──
  set('rock', 'fighting', 2);
  set('rock', 'ground', 2);
  set('rock', 'steel', 2);
  set('rock', 'water', 2);
  set('rock', 'grass', 2);
  set('rock', 'normal', 0.5);
  set('rock', 'flying', 0.5);
  set('rock', 'poison', 0.5);
  set('rock', 'fire', 0.5);

  // ── Bug ──
  set('bug', 'flying', 2);
  set('bug', 'rock', 2);
  set('bug', 'fire', 2);
  set('bug', 'fighting', 0.5);
  set('bug', 'ground', 0.5);
  set('bug', 'grass', 0.5);

  // ── Ghost ──
  set('ghost', 'ghost', 2);
  set('ghost', 'dark', 2);
  set('ghost', 'normal', 0);
  set('ghost', 'fighting', 0);
  set('ghost', 'poison', 0.5);
  set('ghost', 'bug', 0.5);

  // ── Steel ──
  set('steel', 'fighting', 2);
  set('steel', 'ground', 2);
  set('steel', 'fire', 2);
  set('steel', 'normal', 0.5);
  set('steel', 'flying', 0.5);
  set('steel', 'rock', 0.5);
  set('steel', 'bug', 0.5);
  set('steel', 'steel', 0.5);
  set('steel', 'grass', 0.5);
  set('steel', 'psychic', 0.5);
  set('steel', 'ice', 0.5);
  set('steel', 'dragon', 0.5);
  set('steel', 'fairy', 0.5);
  set('steel', 'poison', 0);

  // ── Fire ──
  set('fire', 'ground', 2);
  set('fire', 'rock', 2);
  set('fire', 'water', 2);
  set('fire', 'bug', 0.5);
  set('fire', 'steel', 0.5);
  set('fire', 'fire', 0.5);
  set('fire', 'grass', 0.5);
  set('fire', 'ice', 0.5);
  set('fire', 'fairy', 0.5);

  // ── Water ──
  set('water', 'electric', 2);
  set('water', 'grass', 2);
  set('water', 'steel', 0.5);
  set('water', 'fire', 0.5);
  set('water', 'water', 0.5);
  set('water', 'ice', 0.5);

  // ── Grass ──
  set('grass', 'flying', 2);
  set('grass', 'poison', 2);
  set('grass', 'bug', 2);
  set('grass', 'fire', 2);
  set('grass', 'ice', 2);
  set('grass', 'ground', 0.5);
  set('grass', 'water', 0.5);
  set('grass', 'grass', 0.5);
  set('grass', 'electric', 0.5);

  // ── Electric ──
  set('electric', 'ground', 2);
  set('electric', 'flying', 0.5);
  set('electric', 'steel', 0.5);
  set('electric', 'electric', 0.5);

  // ── Psychic ──
  set('psychic', 'bug', 2);
  set('psychic', 'ghost', 2);
  set('psychic', 'dark', 2);
  set('psychic', 'fighting', 0.5);
  set('psychic', 'psychic', 0.5);

  // ── Ice ──
  set('ice', 'fighting', 2);
  set('ice', 'rock', 2);
  set('ice', 'steel', 2);
  set('ice', 'fire', 2);
  set('ice', 'ice', 0.5);

  // ── Dragon ──
  set('dragon', 'ice', 2);
  set('dragon', 'dragon', 2);
  set('dragon', 'fairy', 2);
  set('dragon', 'fire', 0.5);
  set('dragon', 'water', 0.5);
  set('dragon', 'grass', 0.5);
  set('dragon', 'electric', 0.5);

  // ── Dark ──
  set('dark', 'fighting', 2);
  set('dark', 'bug', 2);
  set('dark', 'fairy', 2);
  set('dark', 'ghost', 0.5);
  set('dark', 'dark', 0.5);
  set('dark', 'psychic', 0);

  // ── Fairy ──
  set('fairy', 'poison', 2);
  set('fairy', 'steel', 2);
  set('fairy', 'fighting', 0.5);
  set('fairy', 'bug', 0.5);
  set('fairy', 'dark', 0.5);
  set('fairy', 'dragon', 0);

  return m;
}

export const TYPE_MATRIX = buildMatrix();
export { ALL_TYPES };
