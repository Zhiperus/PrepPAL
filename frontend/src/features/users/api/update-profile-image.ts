import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

export const updateProfileImage = ({ data }: { data: FormData }) => {
  return api.patch('/users/avatar', data);
};

type UseUpdateProfileImageOptions = {
  mutationConfig?: MutationConfig<typeof updateProfileImage>;
};

export const useUpdateProfileImage = ({
  mutationConfig,
}: UseUpdateProfileImageOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      // Invalidate user data to fetch the new image URL
      queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProfileImage,
  });
};
