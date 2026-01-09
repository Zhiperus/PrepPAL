import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getInfiniteFeedQueryOptions } from './get-posts';

import { api } from '@/lib/api-client';

export const createPost = ({ caption }: { caption: string }) => {
  return api.post('/posts', { caption });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(getInfiniteFeedQueryOptions());
    },
  });
};
