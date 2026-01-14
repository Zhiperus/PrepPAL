import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';

export const deleteLgu = ({ id }: { id: string }) => {
  return api.delete(`/lgus/${id}`);
};

type UseDeleteLguOptions = {
  mutationConfig?: MutationConfig<typeof deleteLgu>;
};

export const useDeleteLgu = ({ mutationConfig }: UseDeleteLguOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      // Refresh the LGU list immediately
      queryClient.invalidateQueries({ queryKey: ['lgus'] });
    },
    ...mutationConfig,
    mutationFn: deleteLgu,
  });
};
