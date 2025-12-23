import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type VerifyEmailInput = {
  token: string;
};

export const verifyEmail = ({ data }: { data: VerifyEmailInput }) => {
  return api.post('/auth/verify-email', data);
};

export const useVerifyEmailQuery = (token: string | null) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      const response = await verifyEmail({ data: { token: token! } });
      queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
      return response;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
