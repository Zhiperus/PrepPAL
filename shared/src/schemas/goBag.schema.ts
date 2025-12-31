import { z } from "zod";

export const UpdateGoBagSchema = z.object({
  items: z.array(z.string()),
  image: z.instanceof(File).optional(),
});

export const BagItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  category: z.string(),
  isPacked: z.boolean(),
});

export const GoBagResponseSchema = z.object({
  items: z.array(BagItemSchema),
  completeness: z.number(),
  imageUrl: z.string().nullable(),
});

export type UpdateGoBagRequest = z.infer<typeof UpdateGoBagSchema>;
export type BagItem = z.infer<typeof BagItemSchema>;
export type GoBagResponse = z.infer<typeof GoBagResponseSchema>;
