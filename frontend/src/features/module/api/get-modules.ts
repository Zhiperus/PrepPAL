import type { ModuleListEntry } from '@repo/shared/dist/schemas/module.schema';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getModules = (): Promise<{
  data: ModuleListEntry[];
}> => {
  return api.get('/modules');
};

export const getModulesQueryOptions = () => {
  return queryOptions({
    queryKey: ['modules'],
    queryFn: getModules,
  });
};

type UseModulesOptions = {
  queryConfig?: QueryConfig<typeof getModulesQueryOptions>;
};

export const useModules = ({ queryConfig }: UseModulesOptions = {}) => {
  return useQuery({
    ...getModulesQueryOptions(),
    ...queryConfig,
  });
};
