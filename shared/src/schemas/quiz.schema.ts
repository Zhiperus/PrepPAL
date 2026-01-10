import { z } from "zod";

export const quizQuestionSchemaZod = z.object({
  _id: z.string().optional(),
  questionText: z.string().min(1, "Question text is required"),
  choices: z
    .array(
      z.object({
        id: z.number(), // The unique identifier for the choice
        text: z.string().min(1, "Choice text cannot be empty"),
      }),
    )
    .min(2, "A question must have at least 2 choices"),
  // correctAnswer stores the 'id' of the correct choice
  correctAnswer: z.number(),
});

export const quizSchemaZod = z.object({
  _id: z.string(),
  moduleId: z.string().min(1, "Module ID is required"),
  questions: z
    .array(quizQuestionSchemaZod)
    .min(1, "Quiz must have at least one question"),
});

export type Quiz = z.infer<typeof quizSchemaZod>;
export type QuizQuestion = z.infer<typeof quizQuestionSchemaZod>;
