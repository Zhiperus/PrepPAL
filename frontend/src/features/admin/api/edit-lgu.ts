import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LguTenant } from './get-lgus';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

// Data required to update an LGU
export type UpdateLguDTO = {
  barangayCode: string; // Needed for the URL
  data: {
    name?: string;
    status?: 'active' | 'inactive';
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
  };
};

export const updateLgu = ({
  barangayCode,
  data,
}: UpdateLguDTO): Promise<LguTenant> => {
  return api.patch(`/admin/lgus/${barangayCode}`, data);
};

type UseUpdateLguOptions = {
  config?: MutationConfig<typeof updateLgu>;
};

export const useUpdateLgu = ({ config }: UseUpdateLguOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      // Refetch the list to show updated details
      queryClient.invalidateQueries({ queryKey: ['lgus'] });
    },
    ...config,
    mutationFn: updateLgu,
  });
};
