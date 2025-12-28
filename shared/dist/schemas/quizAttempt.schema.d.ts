import { z } from "zod";
import mongoose from "mongoose";
export declare const quizAttemptSchemaZod: z.ZodObject<{
    quizId: z.ZodCustom<mongoose.Types.ObjectId, mongoose.Types.ObjectId>;
    userId: z.ZodCustom<mongoose.Types.ObjectId, mongoose.Types.ObjectId>;
    answers: z.ZodArray<z.ZodObject<{
        answer: z.ZodString;
        correctAnswer: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchemaZod>;
