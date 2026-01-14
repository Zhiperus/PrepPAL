import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';
import type { Meta } from '@/types/api';

// Define the shape of an LGU Tenant
export type LguTenant = {
  id: string;
  name: string;
  adminEmail: string;
  status: 'active' | 'inactive';
  region: string;
  province: string;
  city: string;
  barangay?: string;
  registeredUsers: number;
};

export type LguResponse = {
  data: LguTenant[];
  meta: Meta;
};
// Request parameters (search, etc.)
export type GetLgusOptions = {
  search?: string;
  page?: number;
  limit?: number;
};

// API function
export const getLgus = ({
  search,
  page = 1,
  limit = 10,
}: GetLgusOptions = {}): Promise<LguResponse> => {
  return api.get('/admin/lgus', {
    params: {
      search,
      page,
      limit,
    },
  });
};

// Query Options
type UseLgusOptions = {
  params?: GetLgusOptions;
  queryConfig?: QueryConfig<typeof getLgus>;
};

export const useLgus = ({ params, queryConfig }: UseLgusOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['lgus', params],
    queryFn: () => getLgus(params),
  });
};
