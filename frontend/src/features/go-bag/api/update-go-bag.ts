import type { UpdateGoBagRequest } from '@repo/shared/dist/schemas/goBag.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getGoBagQueryOptions } from './get-go-bag';

import { getInfiniteFeedQueryOptions } from '@/features/community-posts/api/get-posts';
import { api } from '@/lib/api-client';

export const updateGoBag = async ({ items, image }: UpdateGoBagRequest) => {
  const formData = new FormData();

  items.forEach((id) => formData.append('items[]', id));

  if (image) {
    formData.append('image', image);
  }

  return api.put('/gobag', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useUpdateGoBag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGoBag,
    onSuccess: () => {
      queryClient.invalidateQueries(getGoBagQueryOptions());
      queryClient.invalidateQueries(getInfiniteFeedQueryOptions());
    },
  });
};
