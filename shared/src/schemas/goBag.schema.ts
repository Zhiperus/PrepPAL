import { z } from "zod";

export const BagItemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  category: z.string(),

  // Calculated by Backend:
  // true = User has ID in their GoBag.items array
  // false = User does not have ID
  isPacked: z.boolean(),
});

// The API Response
export const GoBagResponseSchema = z.object({
  items: z.array(BagItemSchema),
  completeness: z.number(), // 0-100 score
});

export type BagItem = z.infer<typeof BagItemSchema>;
