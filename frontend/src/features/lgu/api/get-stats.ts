import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export type DashboardStats = {
  totalUsers: number;
  pendingReports: number;
  avgCompletion: number;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/admin/stats');
  return response.data;
};

export const getDashboardStatsQueryOptions = () => {
  return queryOptions({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
    initialData: { totalUsers: 0, pendingReports: 0, avgCompletion: 0 },
  });
};

type UseDashboardStatsOptions = {
  config?: QueryConfig<typeof getDashboardStatsQueryOptions>;
};

export const useDashboardStats = ({ config }: UseDashboardStatsOptions = {}) => {
  return useQuery({
    ...getDashboardStatsQueryOptions(),
    ...config,
  });
};