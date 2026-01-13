import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type ItemStat = {
  name: string;
  count: number; // This is the percentage (0-100)
  rawCount: number; // The actual number of users
};

export type ReadinessStat = {
  fullyPrepared: number;
  partiallyPrepared: number;
  atRisk: number;
  total: number;
};

export type GoBagAnalyticsResponse = {
  itemBreakdown: ItemStat[];
  distribution: ReadinessStat;
};

export const getGoBagAnalytics = ({
  barangayCode,
}: {
  barangayCode: string;
}): Promise<GoBagAnalyticsResponse> => {
  return api.get('/lgu/go-bag-analytics', {
    params: { barangayCode },
  });
};

export const useGoBagAnalytics = (barangayCode: string) => {
  return useQuery({
    queryKey: ['lgu-analytics', barangayCode],
    queryFn: () => getGoBagAnalytics({ barangayCode }),
    enabled: !!barangayCode,
  });
};
