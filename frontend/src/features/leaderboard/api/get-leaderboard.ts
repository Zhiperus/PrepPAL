import type { LeaderboardResponse } from '@repo/shared/dist/schemas/leaderboard.schema';
import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

type GetLeaderboardParams = {
  barangay?: string;
  limit?: number;
  search?: string;
  metric?: 'allTime' | 'goBag';
};

export const getLeaderboard = (
  params?: GetLeaderboardParams,
): Promise<{ data: LeaderboardResponse }> => {
  return api.get('/leaderboard', { params });
};

export const getLeaderboardQueryOptions = (params?: GetLeaderboardParams) => {
  return queryOptions({
    queryKey: ['leaderboard', params],
    queryFn: () => getLeaderboard(params),
  });
};

type UseLeaderboardOptions = {
  params?: GetLeaderboardParams;
  queryConfig?: QueryConfig<typeof getLeaderboardQueryOptions>;
};

export const useLeaderboard = ({
  params,
  queryConfig,
}: UseLeaderboardOptions = {}) => {
  return useQuery({
    ...getLeaderboardQueryOptions(params),
    ...queryConfig,
  });
};
