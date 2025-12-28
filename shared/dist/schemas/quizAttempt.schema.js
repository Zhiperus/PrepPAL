import { z } from "zod";
import mongoose from "mongoose";
const answerSchema = z.object({
    answer: z.string().nonempty("Answer is required"),
    correctAnswer: z.string().nonempty("Correct answer is required"),
});
export const quizAttemptSchemaZod = z.object({
    quizId: z.instanceof(mongoose.Types.ObjectId),
    userId: z.instanceof(mongoose.Types.ObjectId),
    answers: z.array(answerSchema).min(1, "At least one answer is required"),
});
