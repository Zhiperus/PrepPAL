import { z } from "zod";

export const lguSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "LGU name is required").max(100),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City/Municipality is required"),
  createdAt: z.date().optional(),
});

export type Lgu = z.infer<typeof lguSchema>;
