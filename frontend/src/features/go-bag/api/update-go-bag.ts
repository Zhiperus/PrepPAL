import type { UpdateGoBagRequest } from '@repo/shared/dist/schemas/goBag.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getGoBagQueryOptions } from './get-go-bag';

import { api } from '@/lib/api-client';

export const updateGoBag = async ({ items, image }: UpdateGoBagRequest) => {
  const formData = new FormData();

  formData.append('items', JSON.stringify(items));

  if (image) {
    formData.append('image', image);
  }

  return api.patch('/goBags', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useUpdateGoBag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGoBag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
      queryClient.invalidateQueries(getGoBagQueryOptions());
    },
  });
};
