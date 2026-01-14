import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/react-query';
import type { Meta } from '@/types/api';

// 1. Updated Type to match the AGGREGATION result
export type QuestionReport = {
  _id: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;

  quizContext: {
    moduleId: string;
    moduleTitle: string;
    moduleContent: { text: string; imageUrl?: string }[]; // Add this!
    reportedQuestion: {
      questionText: string;
      choices: { id: number; text: string }[];
      correctAnswer: number;
    };
  };

  questionId: string; // The raw ID string

  reporterId: {
    _id: string;
    householdName: string;
    email: string;
    profileImage?: string;
  };
};

export type QuestionReportResponse = {
  data: QuestionReport[];
  meta: Meta;
};

// 2. Fetch Function (Endpoint updated to match your likely route)
export const getQuestionReports = ({
  status = 'PENDING',
  page = 1,
  limit = 10,
}: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<QuestionReportResponse> => {
  return api.get('/question-reports', {
    params: { status, page, limit },
  });
};

type UseQuestionReportsOptions = {
  status?: string;
  page?: number;
  limit?: number;
  queryConfig?: QueryConfig<typeof getQuestionReports>;
};

// 3. Hook
export const useQuestionReports = ({
  status,
  page,
  limit,
  queryConfig,
}: UseQuestionReportsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['question-reports', status, page, limit],
    queryFn: () => getQuestionReports({ status, page, limit }),
  });
};
