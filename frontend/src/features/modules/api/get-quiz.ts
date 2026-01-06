import { useQuery } from '@tanstack/react-query';

import { MOCK_QUIZ } from './mock-data';

export const getQuiz = async (moduleId: string): Promise<any> => {

  await new Promise((resolve) => setTimeout(resolve, 800));
  

  return MOCK_QUIZ;
};

export const useQuiz = (moduleId: string) => {
  return useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: () => getQuiz(moduleId),
    enabled: true, 
  });
};