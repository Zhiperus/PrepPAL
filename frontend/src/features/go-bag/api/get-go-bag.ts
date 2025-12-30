import type { GoBagResponse } from '@repo/shared/dist/schemas/goBag.schema';
import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getGoBag = (): Promise<GoBagResponse> => {
  return api.get('/goBags');
};

export const getGoBagQueryOptions = () => {
  return queryOptions({
    queryKey: ['gobag'],
    queryFn: getGoBag,
  });
};

type UseGoBagOptions = {
  queryConfig?: QueryConfig<typeof getGoBagQueryOptions>;
};

export const useGoBag = ({ queryConfig }: UseGoBagOptions = {}) => {
  return useQuery({
    ...getGoBagQueryOptions(),
    ...queryConfig,
  });
};
