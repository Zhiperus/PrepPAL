import type { QuizAttemptInput } from '@repo/shared/dist/schemas/quizAttempt.schema';
import { useMutation } from '@tanstack/react-query';

import { MOCK_QUIZ } from './mock-data';

type SubmitQuizPayload = {
  moduleId: string;
  answers: QuizAttemptInput['answers'];
};

export const submitQuiz = async (data: SubmitQuizPayload) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // MANUAL GRADING (Frontend Logic muna)
  let correctCount = 0;
  const totalQuestions = MOCK_QUIZ.questions.length;

  data.answers.forEach((ans) => {
    const question = MOCK_QUIZ.questions[ans.questionIndex];
    const correctChoice = question?.choices.find((choice) => choice.isCorrect);
    if (question && correctChoice?.id === ans.selectedAnswerId) {
      correctCount++;
    }
  });

  const score = (correctCount / totalQuestions) * 100;
  const passed = score >= 70;

  return {
    success: true,
    score,
    passed,
    correctCount,
    totalQuestions,
    pointsAwarded: passed ? 10 : 0 // Fake points logic
  };
};

export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: submitQuiz,
  });
};