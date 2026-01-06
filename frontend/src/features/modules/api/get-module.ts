import type { Module } from '@repo/shared/dist/schemas/module.schema';
import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getModule = (moduleId: string): Promise<{ data: Module }> => {
  return api.get(`/modules/${moduleId}`);
};

export const getModuleQueryOptions = (moduleId: string) => {
  return queryOptions({
    queryKey: ['modules', { moduleId }],
    queryFn: () => getModule(moduleId),
  });
};

type UseModuleOptions = {
  moduleId: string;
  queryConfig?: QueryConfig<typeof getModuleQueryOptions>;
};

export const useModule = ({ moduleId, queryConfig }: UseModuleOptions) => {
  return useQuery({
    ...getModuleQueryOptions(moduleId),
    ...queryConfig,
  });
};
