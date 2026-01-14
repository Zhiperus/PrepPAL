import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';

export type CreateReportDTO = {
  postId: string;
  reason: string;
};

export const createContentReport = (data: CreateReportDTO): Promise<any> => {
  return api.post('/content-reports', data);
};

type UseCreateReportOptions = {
  mutationConfig?: MutationConfig<typeof createContentReport>;
};

export const useCreateReport = ({
  mutationConfig,
}: UseCreateReportOptions = {}) => {
  return useMutation({
    onSuccess: () => {},
    ...mutationConfig,
    mutationFn: createContentReport,
  });
};
