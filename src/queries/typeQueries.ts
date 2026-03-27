import { useQuery } from '@tanstack/react-query';

const TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
  'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
] as const;

export type MatchupMatrix = Record<string, Record<string, number>>;

/**
 * Fetches all 18 core types from PokeAPI and compiles their `damage_relations` 
 * into a complete, mathematically flawless 18x18 multiplier matrix.
 * Matrix Format: matrix[DefenderType][AttackerType] = multiplier
 */
export function useAllTypeMatchups() {
  return useQuery({
    queryKey: ['type-matchups-matrix'],
    queryFn: async (): Promise<MatchupMatrix> => {
      // Parallelize 18 fetches since PokeAPI resolves them in ~50ms
      const promises = TYPES.map(t => fetch(`https://pokeapi.co/api/v2/type/${t}`).then(res => res.json()));
      const typeData = await Promise.all(promises);

      // Initialize an empty 18x18 matrix defaulted to 1.0 multiplier
      const matrix: MatchupMatrix = {};
      TYPES.forEach(t => {
        matrix[t] = {};
        TYPES.forEach(atk => {
          matrix[t][atk] = 1.0;
        });
      });

      // Populate exact multipliers based on PokeAPI's dual-directional damage relations
      typeData.forEach((data: any) => {
        const defenderType = data.name;
        
        data.damage_relations.double_damage_from.forEach((rel: any) => {
          if (matrix[defenderType]) matrix[defenderType][rel.name] = 2.0;
        });
        data.damage_relations.half_damage_from.forEach((rel: any) => {
          if (matrix[defenderType]) matrix[defenderType][rel.name] = 0.5;
        });
        data.damage_relations.no_damage_from.forEach((rel: any) => {
          if (matrix[defenderType]) matrix[defenderType][rel.name] = 0.0;
        });
      });

      return matrix;
    },
    staleTime: Infinity, // Type matchups never change, cache forever
    gcTime: Infinity
  });
}
