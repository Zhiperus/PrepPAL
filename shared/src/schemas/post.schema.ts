import { z } from "zod";
import mongoose from "mongoose";

export const postSchemaZod = z.object({
  userId: z.instanceof(mongoose.Types.ObjectId),
  imageUrl: z.string().nonempty("Image URL is required"),
  goBagId: z.instanceof(mongoose.Types.ObjectId).optional(),
  date: z.date().default(() => new Date()),
  averageScore: z.number(),
});

export type PostInput = z.infer<typeof postSchemaZod>;
