import { z } from "zod";

export const questionReportSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  questionId: z.string(),
  reporterId: z.string(),
  reason: z
    .string()
    .min(10, "Please provide a more detailed reason (min 10 characters)")
    .max(500, "Reason is too long"),
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]).default("PENDING"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const GetQuestionReportsQuerySchema = z.object({
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().default(10),
  page: z.coerce.number().default(1),
  status: z
    .enum(["PENDING", "RESOLVED", "DISMISSED", "ALL"])
    .default("PENDING"),
  lguId: z.string().optional(),
});

export const CompleteQuestionReportRequestSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
});

export type QuestionReport = z.infer<typeof questionReportSchema>;
export type GetQuestionReportsQuery = z.infer<
  typeof GetQuestionReportsQuerySchema
>;
export type CompleteQuestionReportRequest = z.infer<
  typeof CompleteQuestionReportRequestSchema
>;
