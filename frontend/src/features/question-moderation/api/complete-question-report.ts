import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

// The data shape expected by your backend's CompleteReportRequest
export type CompleteQuestionReportDTO = {
  reportId: string;
  status: 'RESOLVED' | 'DISMISSED';
};

export const completeQuestionReport = ({
  reportId,
  status,
}: CompleteQuestionReportDTO) => {
  return api.patch(`/question-reports/${reportId}/complete`, { status });
};

type UseCompleteQuestionReportOptions = {
  mutationConfig?: MutationConfig<typeof completeQuestionReport>;
};

export const useCompleteQuestionReport = ({
  mutationConfig,
}: UseCompleteQuestionReportOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: completeQuestionReport,
  });
};
