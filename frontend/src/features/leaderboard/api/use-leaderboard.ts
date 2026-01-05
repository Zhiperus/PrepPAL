import type { GetLeaderboardQuery } from '@repo/shared/dist/schemas/user.schema';
import { useQuery } from '@tanstack/react-query';

import { fetchLeaderboard } from './get-leaderboard';


export const useLeaderboard = (filters: Partial<GetLeaderboardQuery>) => {
  return useQuery({
    queryKey: ['leaderboard', filters], 
    
    queryFn: () => fetchLeaderboard({
      sortBy: 'totalPoints', // default
      order: 'desc',
      limit: 10,
      page: 1,
      ...filters,
    }),
  });
};