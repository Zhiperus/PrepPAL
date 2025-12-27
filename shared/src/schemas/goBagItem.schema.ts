import { z } from "zod";

export const GoBagItemSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  category: z.enum([
    "food",
    "water",
    "hygiene",
    "first-aid",
    "tools",
    "tech",
    "clothing",
  ]),
  defaultQuantity: z.number().default(1),
});

export type GoBagItem = z.infer<typeof GoBagItemSchema>;
