import type { CreatePostRequest } from '@repo/shared/dist/schemas/post.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getInfiniteFeedQueryOptions } from './get-posts';

import { api } from '@/lib/api-client';

export const createPost = ({ caption, image }: CreatePostRequest) => {
  const formData = new FormData();
  formData.append('caption', caption);
  formData.append('image', image);

  return api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
