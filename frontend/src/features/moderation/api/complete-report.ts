import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

// The data shape expected by your backend's CompleteReportRequest
export type CompleteReportDTO = {
  reportId: string;
  status: 'RESOLVED' | 'DISMISSED';
};

export const completeReport = ({ reportId, status }: CompleteReportDTO) => {
  // Assuming your controller maps this to PATCH /reports/:id
  return api.patch(`/reports/${reportId}/complete`, { status });
};

type UseCompleteReportOptions = {
  mutationConfig?: MutationConfig<typeof completeReport>;
};

export const useCompleteReport = ({
  mutationConfig,
}: UseCompleteReportOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: completeReport,
  });
};
