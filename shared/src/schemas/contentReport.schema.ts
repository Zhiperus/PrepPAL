import { z } from "zod";

export const contentReportSchema = z.object({
  id: z.string(),
  postId: z.string(),
  reporterId: z.string(),
  reason: z
    .string()
    .min(10, "Please provide a more detailed reason (min 10 characters)")
    .max(500, "Reason is too long"),
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]).default("PENDING"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const GetReportsQuerySchema = z.object({
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().default(10),
  page: z.coerce.number().default(1),
  status: z
    .enum(["PENDING", "RESOLVED", "DISMISSED", "ALL"])
    .default("PENDING"),
  lguId: z.string().optional(),
});

export const CompleteReportRequestSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
});

export type ContentReport = z.infer<typeof contentReportSchema>;
export type GetReportsQuery = z.infer<typeof GetReportsQuerySchema>;
export type CompleteReportRequest = z.infer<typeof CompleteReportRequestSchema>;
