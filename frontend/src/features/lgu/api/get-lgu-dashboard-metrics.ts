import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export interface DashboardMetricsResponse {
  lguDetails: {
    name: string;
    location: string;
  };
  overall: {
    averageScore: number;
    totalCitizens: number;
  };
  reports: {
    total: number;
    pending: number;
  };
  engagement: {
    activeThisWeek: number;
  };
}

export const getLguDashboardMetrics = (): Promise<{
  data: DashboardMetricsResponse;
}> => {
  return api.get('/lgu/dashboard-metrics');
};

export const getLguDashboardMetricsQueryOptions = () => {
  return queryOptions({
    queryKey: ['lgu-dashboard-metrics'],
    queryFn: getLguDashboardMetrics,
  });
};

type UseLguDashboardMetricsOptions = {
  queryConfig?: QueryConfig<typeof getLguDashboardMetricsQueryOptions>;
};

export const useLguDashboardMetrics = ({
  queryConfig,
}: UseLguDashboardMetricsOptions = {}) => {
  return useQuery({
    ...getLguDashboardMetricsQueryOptions(),
    ...queryConfig,
  });
};
