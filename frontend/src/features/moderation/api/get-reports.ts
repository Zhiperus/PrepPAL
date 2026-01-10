import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

// 1. Updated Type Definitions to match Post Model & Backend Populate
export type ContentReport = {
  _id: string;
  lguId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;

  // Populated Reporter
  reporterId: {
    _id: string;
    householdName: string;
    email: string;
    profileImage?: string;
    lguId: string;
  };

  // Populated Post
  postId: {
    _id: string;
    imageUrl: string; // Matches Post model
    caption?: string; // Matches Post model
    createdAt: string;

    // Populated Author (Post model uses 'userId')
    userId: {
      _id: string;
      householdName: string;
      email: string;
      profileImage?: string;
      lguId: string;
    };
  } | null;
};

// 2. Pagination Meta Type
export type ContentReportResponse = {
  data: ContentReport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// 3. Fetch Function
export const getContentReports = ({
  lguId,
  page = 1,
  limit = 10,
}: {
  lguId: string;
  page?: number;
  limit?: number;
}): Promise<ContentReportResponse> => {
  return api.get('/reports', {
    params: { lguId, page, limit },
  });
};

type UseContentReportsOptions = {
  lguId: string;
  page?: number;
  limit?: number;
  queryConfig?: QueryConfig<typeof getContentReports>;
};

// 4. Hook
export const useContentReports = ({
  lguId,
  page,
  limit,
  queryConfig,
}: UseContentReportsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['content-reports', lguId, page, limit],
    queryFn: () => getContentReports({ lguId, page, limit }),
    enabled: !!lguId,
  });
};
