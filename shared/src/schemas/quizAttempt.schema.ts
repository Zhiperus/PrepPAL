import { z } from "zod";

export const quizAttemptSchemaZod = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  userId: z.string().min(1, "User ID is required"),
  answers: z.array(z.number()),
  correctAnswers: z.number().min(0).default(0),
  createdAt: z.date().optional(),
});

export type QuizAttempt = z.infer<typeof quizAttemptSchemaZod>;
