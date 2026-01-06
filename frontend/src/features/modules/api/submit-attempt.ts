import type { QuizAttemptInput } from '@repo/shared/dist/schemas/quizAttempt.schema'; // Adjust path if needed
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

export const submitQuiz = (data: QuizAttemptInput & { moduleId: string }) => {
  return api.post(`/modules/${data.moduleId}/quiz-attempt`, data);
};

type UseSubmitQuizOptions = {
  mutationConfig?: MutationConfig<typeof submitQuiz>;
};

export const useSubmitQuiz = ({
  mutationConfig,
}: UseSubmitQuizOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
      queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
    },
    ...restConfig,
    mutationFn: submitQuiz,
  });
};

