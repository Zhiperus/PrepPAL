import type { OnboardingRequest } from '@repo/shared/dist/schemas/user.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

export const updateOnboarding = ({ data }: { data: OnboardingRequest }) => {
  return api.put('/users/onboarding', data);
};

type UseUpdateOnboardingOptions = {
  mutationConfig?: MutationConfig<typeof updateOnboarding>;
};

export const useUpdateOnboarding = ({
  mutationConfig,
}: UseUpdateOnboardingOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateOnboarding,
  });
};
