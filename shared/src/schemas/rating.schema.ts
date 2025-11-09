import { z } from "zod";
import mongoose from "mongoose";

const ratingItemSchema = z.object({
  item: z.instanceof(mongoose.Types.ObjectId),
  quantity: z.number().int().nonnegative(),
});

export const ratingSchemaZod = z.object({
  postId: z.instanceof(mongoose.Types.ObjectId).optional(),
  goBagId: z.instanceof(mongoose.Types.ObjectId).optional(),
  userId: z.instanceof(mongoose.Types.ObjectId).optional(),
  recommendedBasis: z.array(ratingItemSchema).optional().default([]),
  checklistResults: z.array(ratingItemSchema).optional().default([]),
  createdAt: z
    .date()
    .optional()
    .default(() => new Date()),
  weightedScore: z.number(),
});

// TypeScript type inference
export type RatingInput = z.infer<typeof ratingSchemaZod>;
