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

export type ContentReport = z.infer<typeof contentReportSchema>;
