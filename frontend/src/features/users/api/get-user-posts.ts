import type { Post } from '@repo/shared/dist/schemas/post.schema';
import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';
import type { Meta } from '@/types/api';

export type GetUserPostsParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export const getUserPosts = (
  userId: string,
  params?: GetUserPostsParams,
): Promise<{
  data: Post[];
  meta: Meta;
}> => {
  return api.get(`/posts/user/${userId}`, { params });
};

export const getUserPostsQueryOptions = (
  userId: string,
  params?: GetUserPostsParams,
) => {
  return queryOptions({
    queryKey: ['posts', 'user', userId, params],
    queryFn: () => getUserPosts(userId, params),
    enabled: !!userId,
  });
};

type UseUserPostsOptions = {
  userId: string;
  params?: GetUserPostsParams;
  queryConfig?: QueryConfig<typeof getUserPostsQueryOptions>;
};

export const useUserPosts = ({
  userId,
  params,
  queryConfig,
}: UseUserPostsOptions) => {
  return useQuery({
    ...getUserPostsQueryOptions(userId, params),
    ...queryConfig,
  });
};
