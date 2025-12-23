import { z } from "zod";
import mongoose from "mongoose";

const questionSchema = z.object({
  questionText: z.string().nonempty("Question text is required"),
  choices: z
    .array(z.string().nonempty("Choice cannot be empty"))
    .min(2, "At least two choices required"),
  correctAnswer: z.string().nonempty("Correct answer is required"),
});

export const quizSchemaZod = z.object({
  moduleId: z.instanceof(mongoose.Types.ObjectId),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

export type QuizInput = z.infer<typeof quizSchemaZod>;
