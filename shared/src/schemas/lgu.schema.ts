import { z } from "zod";

export const lguSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "LGU name is required").max(100),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City/Municipality is required"),
  createdAt: z.date().optional(),
});

export const GetLgusQuerySchema = z.object({
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().default(10),
  page: z.coerce.number().default(1),
});

export const CreateLguSchema = z.object({
  name: z.string().min(1, "LGU name is required").max(100),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
});

export type Lgu = z.infer<typeof lguSchema>;
export type GetLguRequest = z.infer<typeof GetLgusQuerySchema>;
export type CreateLguRequest = z.infer<typeof CreateLguSchema>;
