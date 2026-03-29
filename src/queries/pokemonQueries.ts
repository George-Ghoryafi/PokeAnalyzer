import { queryOptions } from '@tanstack/react-query';
import { getAllPokemon, getPokemonDetails, getPokemonSpeciesDetails } from '../lib/api';

export const pokemonQueries = {
  all: () => ['pokemon'] as const,
  lists: () => [...pokemonQueries.all(), 'list'] as const,
  list: () => queryOptions({
    queryKey: pokemonQueries.lists(),
    queryFn: () => getAllPokemon(),
  }),
  details: () => [...pokemonQueries.all(), 'detail'] as const,
  detail: (name: string) => queryOptions({
    queryKey: [...pokemonQueries.details(), name],
    queryFn: ({ signal }) => getPokemonDetails(name, signal),
  }),
  speciesDetails: () => [...pokemonQueries.all(), 'species'] as const,
  species: (name: string) => queryOptions({
    queryKey: [...pokemonQueries.speciesDetails(), name],
    queryFn: ({ signal }) => getPokemonSpeciesDetails(name, signal),
  }),
};
