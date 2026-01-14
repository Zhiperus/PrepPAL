import type { Quiz } from '@repo/shared/dist/schemas/quiz.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

export type UpdateQuizDTO = Partial<Quiz>;

export const updateQuiz = ({
  quizId,
  data,
}: {
  quizId: string;
  data: UpdateQuizDTO;
}) => {
  // Ensure we strip the _id from the body so Mongo doesn't throw an "immutable field" error
  const { _id, ...payload } = data as any;
  return api.put(`/quiz/${quizId}`, payload);
};

type UseUpdateQuizOptions = {
  config?: MutationConfig<typeof updateQuiz>;
};

export const useUpdateQuiz = ({ config }: UseUpdateQuizOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
    ...config,
    mutationFn: updateQuiz,
  });
};
