import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

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
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// 3. Fetch Function
export const getContentReports = ({
  barangayCode,
  page = 1,
  limit = 10,
}: {
  // [Fixed] Allow undefined for Super Admins
  barangayCode?: string;
  page?: number;
  limit?: number;
}): Promise<ContentReportResponse> => {
  return api.get('/content-reports', {
    // Axios automatically skips keys with undefined values
    params: { barangayCode, page, limit },
  });
};

type UseContentReportsOptions = {
  // [Fixed] Allow undefined
  barangayCode?: string;
  page?: number;
  limit?: number;
  queryConfig?: QueryConfig<typeof getContentReports>;
};

// 4. Hook
export const useContentReports = ({
  barangayCode,
  page,
  limit,
  queryConfig,
}: UseContentReportsOptions) => {
  return useQuery({
    ...queryConfig,
    // [Fixed] Includes undefined in the key so caching works separately for global vs local
    queryKey: ['content-reports', barangayCode, page, limit],
    queryFn: () => getContentReports({ barangayCode, page, limit }),
    // [Fixed] Removed 'enabled: !!barangayCode' so it runs even without a code (for Super Admin)
  });
};
