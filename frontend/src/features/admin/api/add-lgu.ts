import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { LguTenant } from './get-lgus';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

// Data required to create an LGU
export type AddLguDTO = {
  name: string;
  adminEmail: string;
  password: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  cityCode: string; // Added
  barangayCode: string; // Added
};

export const createLgu = (data: AddLguDTO): Promise<LguTenant> => {
  return api.post('/admin/lgus', data);
};

type UseCreateLguOptions = {
  config?: MutationConfig<typeof createLgu>;
};

export const useCreateLgu = ({ config }: UseCreateLguOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      // Refetch the list of LGUs so the new one appears instantly
      queryClient.invalidateQueries({ queryKey: ['lgus'] });
    },
    ...config,
    mutationFn: createLgu,
  });
};
