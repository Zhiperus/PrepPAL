import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getInfiniteFeedQueryOptions, type SortOption } from './get-posts';

import { api } from '@/lib/api-client';

export const createPost = ({ caption }: { caption: string }) => {
  return api.post('/posts', { caption });
};

export const useCreatePost = ({
  sort,
  search,
  barangayCode,
  cityCode,
}: {
  sort?: SortOption;
  search?: string;
  barangayCode?: string;
  cityCode?: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(
        getInfiniteFeedQueryOptions(
          sort,
          search,
          barangayCode as string,
          cityCode as string,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
    },
  });
};
