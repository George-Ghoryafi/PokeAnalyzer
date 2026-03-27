import { queryOptions } from '@tanstack/react-query';
import { getVersionGroups, getVersionGroupDetails, getPokedex } from '../lib/api';

export const gameQueries = {
  all: () => ['games'] as const,
  lists: () => [...gameQueries.all(), 'list'] as const,
  versionGroups: () => queryOptions({
    queryKey: [...gameQueries.lists(), 'version-groups'],
    queryFn: ({ signal }) => getVersionGroups(signal),
  }),
  allowedPokemon: (versionGroupName: string) => queryOptions({
    queryKey: [...gameQueries.lists(), 'allowed-pokemon-v2', versionGroupName],
    queryFn: async ({ signal }) => {
      if (!versionGroupName || versionGroupName === 'national') return [] as string[];
      
      const vgDetails = await getVersionGroupDetails(versionGroupName, signal);
      
      // If a game has no explicit regional dex (e.g. some spin-offs), fallback to allowing all
      if (!vgDetails.pokedexes || vgDetails.pokedexes.length === 0) {
        return [] as string[]; 
      }

      const allowedNames = new Set<string>();
      
      // A game can have multiple regional pokedexes (e.g. Scarlet/Violet has Paldea, Kitakami, Blueberry)
      // We rapidly fetch all of them in parallel.
      const pokedexPromises = vgDetails.pokedexes.map(dex => getPokedex(dex.url, signal));
      const pokedexResults = await Promise.all(pokedexPromises);
      
      pokedexResults.forEach(dex => {
        dex.pokemon_entries.forEach(entry => {
          allowedNames.add(entry.pokemon_species.name);
        });
      });
      
      return Array.from(allowedNames);
    },
    staleTime: Infinity, // Game dexes don't change
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
};
