import { z } from "zod";
import mongoose from "mongoose";
export declare const quizSchemaZod: z.ZodObject<{
    moduleId: z.ZodCustom<mongoose.Types.ObjectId, mongoose.Types.ObjectId>;
    questions: z.ZodArray<z.ZodObject<{
        questionText: z.ZodString;
        choices: z.ZodArray<z.ZodString>;
        correctAnswer: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type QuizInput = z.infer<typeof quizSchemaZod>;
