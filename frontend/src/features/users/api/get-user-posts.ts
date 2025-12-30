import type { Post } from '@repo/shared/dist/schemas/post.schema';
import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getUserPosts = ({
  userId,
}: {
  userId: string;
}): Promise<Post[]> => {
  return api.get(`/posts`, {
    params: { userId },
  });
};

export const getUserPostsQueryOptions = (userId: string) => {
  return queryOptions({
    queryKey: ['posts', { userId }],
    queryFn: () => getUserPosts({ userId }),
    enabled: !!userId,
  });
};

type UseUserPostsOptions = {
  userId: string;
  queryConfig?: QueryConfig<typeof getUserPostsQueryOptions>;
};

export const useUserPosts = ({ userId, queryConfig }: UseUserPostsOptions) => {
  return useQuery({
    ...getUserPostsQueryOptions(userId),
    ...queryConfig,
  });
};
