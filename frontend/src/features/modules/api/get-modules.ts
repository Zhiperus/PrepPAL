import type { ModuleListEntry } from '@repo/shared/dist/schemas/module.schema';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export type GetModulesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const getModules = ({
  page = 1,
  limit = 10,
  search = '',
}: GetModulesParams = {}): Promise<{
  data: ModuleListEntry[];
  meta: { total: number; totalPages: number; page: number };
}> => {
  return api.get('/modules', {
    params: {
      page,
      limit,
      search,
    },
  });
};

export const getModulesQueryOptions = (params: GetModulesParams) => {
  return queryOptions({
    queryKey: ['modules', params],
    queryFn: () => getModules(params),
  });
};

type UseModulesOptions = {
  params: GetModulesParams; // Require params here
  queryConfig?: QueryConfig<typeof getModulesQueryOptions>;
};

export const useModules = ({ params, queryConfig }: UseModulesOptions) => {
  return useQuery({
    ...getModulesQueryOptions(params),
    ...queryConfig,
  });
};
