import type { LeaderboardEntry } from '@repo/shared/dist/schemas/leaderboard.schema';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

interface LeaderboardParams {
  barangay?: string;
  limit?: number;
  search?: string;
  metric?: 'allTime' | 'goBag';
}

type APIResponse = {
  success: boolean;
  data: LeaderboardEntry[];
};

export const getLeaderboard = async (params: LeaderboardParams): Promise<LeaderboardEntry[]> => {
  const response = await api.get<APIResponse>('/leaderboard', {
    params,
  });
  
  return response.data.data;
};

export const useLeaderboard = (params: LeaderboardParams) => {
  return useQuery({
    queryKey: ['lgu-leaderboard', params], 
    queryFn: () => getLeaderboard(params),
    staleTime: 1000 * 60, 
  });
};