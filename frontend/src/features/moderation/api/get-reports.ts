import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';
import type { Meta } from '@/types/api';

// 1. Updated Type Definitions to match Post Model & Backend Populate
export type ContentReport = {
  _id: string;
  barangayCode: string;
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
    barangayCode: string;
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
      location: { barangayCode: string };
    };
  } | null;
};

// 2. Pagination Meta Type
export type ContentReportResponse = {
  data: ContentReport[];
  meta: Meta;
};

// 3. Fetch Function
export const getContentReports = ({
  barangayCode,
  page = 1,
  limit = 10,
}: {
  barangayCode?: string;
  page?: number;
  limit?: number;
}): Promise<ContentReportResponse> => {
  return api.get('/content-reports', {
    params: { barangayCode, page, limit },
  });
};

type UseContentReportsOptions = {
  barangayCode?: string;
  page?: number;
  limit?: number;
  queryConfig?: QueryConfig<typeof getContentReports>;
};

export const useContentReports = ({
  barangayCode,
  page,
  limit,
  queryConfig,
}: UseContentReportsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['content-reports', barangayCode, page, limit],
    queryFn: () => getContentReports({ barangayCode, page, limit }),
  });
};
