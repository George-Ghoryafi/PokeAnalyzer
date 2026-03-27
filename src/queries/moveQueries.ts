import { queryOptions } from '@tanstack/react-query';
import { getMoveDetails } from '../lib/api';

export const moveQueries = {
  all: () => ['moves'] as const,
  details: () => [...moveQueries.all(), 'detail'] as const,
  detail: (name: string) => queryOptions({
    queryKey: [...moveQueries.details(), name],
    queryFn: ({ signal }) => getMoveDetails(name, signal),
    staleTime: Infinity, // Move stats (Power/Accuracy/Type) rarely if ever change
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep cached for 7 days
  })
}
