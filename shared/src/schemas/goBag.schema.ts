import { z } from "zod";

export const BagItemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  category: z.string(),
  isPacked: z.boolean(),
});

export const GoBagResponseSchema = z.object({
  items: z.array(BagItemSchema),
  completeness: z.number(),
  imageUrl: z.string().nullable(),
});

export type BagItem = z.infer<typeof BagItemSchema>;
export type GoBagResponse = z.infer<typeof GoBagResponseSchema>;
