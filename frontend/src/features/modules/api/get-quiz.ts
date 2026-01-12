import type { Quiz } from '@repo/shared/dist/schemas/quiz.schema';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';

export const getQuiz = ({
  moduleId,
}: {
  moduleId: string;
}): Promise<{ data: Quiz }> => {
  return api.get(`/modules/${moduleId}/quiz`);
};

export const getQuizQueryOptions = ({ moduleId }: { moduleId: string }) => {
  return queryOptions({
    queryKey: ['quiz', moduleId],
    queryFn: () => getQuiz({ moduleId }),
    enabled: !!moduleId, // Don't fetch if no ID is provided
  });
};

type UseQuizOptions = {
  moduleId: string;
  queryConfig?: QueryConfig<typeof getQuizQueryOptions>;
};

export const useQuiz = ({ moduleId, queryConfig }: UseQuizOptions) => {
  return useQuery({
    ...getQuizQueryOptions({ moduleId }),
    ...queryConfig,
  });
};
