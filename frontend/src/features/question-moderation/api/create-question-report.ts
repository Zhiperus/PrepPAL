import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';

export type CreateQuestionReportDTO = {
  quizId: string;
  questionId: string;
  reason: string;
};

export const createQuestionReport = (
  data: CreateQuestionReportDTO,
): Promise<any> => {
  return api.post('/question-reports', data);
};

type UseCreateQuestionReportOptions = {
  mutationConfig?: MutationConfig<typeof createQuestionReport>;
};

export const useCreateQuestionReport = ({
  mutationConfig,
}: UseCreateQuestionReportOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-reports'] });
    },
    ...mutationConfig,
    mutationFn: createQuestionReport,
  });
};
