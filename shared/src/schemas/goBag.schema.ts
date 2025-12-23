import { z } from "zod";
import mongoose from "mongoose";

const goBagItemSchema = z.object({
  itemId: z.instanceof(mongoose.Types.ObjectId),
  quantity: z.number().int().min(1).default(1),
});

export const goBagSchemaZod = z.object({
  isRecommended: z.boolean(),
  items: z.array(goBagItemSchema).default([]),
});

export type GoBagInput = z.infer<typeof goBagSchemaZod>;
