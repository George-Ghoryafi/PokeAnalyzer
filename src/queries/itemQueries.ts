import { queryOptions } from '@tanstack/react-query';
import { getAllItems, getItemDetails } from '../lib/api';

export const itemQueries = {
  all: () =>
    queryOptions({
      queryKey: ['items', 'all'],
      queryFn: ({ signal }) => getAllItems(signal),
      staleTime: Infinity, // The list of all 2000+ items never changes
      gcTime: Infinity,
    }),
  
  detail: (name: string) =>
    queryOptions({
      queryKey: ['item', name],
      queryFn: ({ signal }) => getItemDetails(name, signal),
      staleTime: 1000 * 60 * 60, // 1 hour
    }),
};
