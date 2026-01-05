import { z } from "zod";

// 1. Schema for User Input (Request Body)
export const quizAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionIndex: z.number().int().min(0),
        selectedAnswerId: z.number().int(),
      })
    )
    .min(1, "You must provide at least one answer"),
});

// 2. Schema for Server Result / Database Record
export const quizAttemptResultSchema = z.object({
  userId: z.string(),
  quizId: z.string(),
  answersSubmitted: z.array(
    z.object({
      questionIndex: z.number().int(),
      selectedAnswerId: z.number().int(),
      isCorrect: z.boolean(),
    })
  ),
  score: z.number().min(0).max(100),
  correctCount: z.number().int(),
  totalQuestions: z.number().int(),
  createdAt: z.coerce.date().default(() => new Date()),
});

// Types
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
export type QuizAttemptResult = z.infer<typeof quizAttemptResultSchema>;

export const quizAttemptSchemaZod = quizAttemptSchema;