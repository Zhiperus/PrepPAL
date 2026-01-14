import type { Module } from '@repo/shared/dist/schemas/module.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

// Define the payload structure based on your needs
// If updating both module and quiz, you might need a composite DTO,
// or separate calls. For now, assuming standard Module update.
export type UpdateModuleDTO = Partial<Module>;

export const updateModule = ({
  moduleId,
  data,
}: {
  moduleId: string;
  data: UpdateModuleDTO;
}) => {
  return api.put(`/modules/${moduleId}`, data);
};

type UseUpdateModuleOptions = {
  config?: MutationConfig<typeof updateModule>;
};

export const useUpdateModule = ({ config }: UseUpdateModuleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, variables) => {
      // Invalidate the specific module query
      queryClient.invalidateQueries({
        queryKey: ['module', variables.moduleId],
      });
      // Optionally invalidate the list of modules if titles/descriptions change
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
    ...config,
    mutationFn: updateModule,
  });
};
