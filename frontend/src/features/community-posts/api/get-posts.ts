import type { FeedPost } from '@repo/shared/dist/schemas/post.schema';
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';
import type { Meta } from '@/types/api';

export type SortOption = 'newest' | 'oldest' | 'popular';

const SORT_MAPPING: Record<
  SortOption,
  { sortBy: string; order: 'asc' | 'desc' }
> = {
  newest: { sortBy: 'createdAt', order: 'desc' },
  oldest: { sortBy: 'createdAt', order: 'asc' },
  popular: { sortBy: 'verificationCount', order: 'desc' },
};

export const getFeed = ({
  page = 1,
  sort = 'newest',
  search = '',
  barangayCode,
  cityCode,
}: {
  page?: number;
  sort?: SortOption;
  search?: string;
  barangayCode?: string;
  cityCode?: string;
}): Promise<{ data: FeedPost[]; meta: Meta }> => {
  const { sortBy, order } = SORT_MAPPING[sort];

  return api.get(`/posts`, {
    params: {
      page,
      limit: 10,
      sortBy,
      order,
      search,
      barangayCode,
      cityCode,
    },
  });
};

export const getInfiniteFeedQueryOptions = (
  sort: SortOption = 'newest',
  search: string = '',
  barangayCode: string,
  cityCode: string,
) => {
  return infiniteQueryOptions({
    queryKey: ['feed', { sort, search, barangayCode, cityCode }],
    queryFn: ({ pageParam = 1 }) => {
      return getFeed({
        page: pageParam as number,
        sort,
        search,
        barangayCode,
        cityCode,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.page === lastPage?.meta?.totalPages) return undefined;
      return lastPage.meta.page + 1;
    },
    initialPageParam: 1,
  });
};

type UseFeedOptions = {
  sort?: SortOption;
  search?: string;
  barangayCode?: string;
  cityCode?: string;
  queryConfig?: QueryConfig<typeof getInfiniteFeedQueryOptions>;
};

export const useInfiniteFeed = ({
  sort = 'newest',
  search = '',
  barangayCode = '',
  cityCode = '',
  queryConfig,
}: UseFeedOptions = {}) => {
  return useInfiniteQuery({
    ...getInfiniteFeedQueryOptions(sort, search, barangayCode, cityCode),
    ...queryConfig,
  });
};
