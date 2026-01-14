import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export type UserRankResponse = {
  rank: number;
  totalScore: number;
};

export const getUserRank = (): Promise<{
  data: UserRankResponse;
}> => {
  return api.get('/users/rank');
};

export const getUserRankQueryOptions = () => {
  return queryOptions({
    queryKey: ['user-rank'],
    queryFn: () => getUserRank(),
  });
};

type UseUserRankOptions = {
  queryConfig?: QueryConfig<typeof getUserRankQueryOptions>;
};

export const useUserRank = ({ queryConfig }: UseUserRankOptions = {}) => {
  return useQuery({
    ...getUserRankQueryOptions(),
    ...queryConfig,
  });
};
