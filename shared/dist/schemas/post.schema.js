import { z } from "zod";
const SnapshotItemSchema = z.object({
    itemId: z.string(),
    name: z.string(),
    category: z.string(),
});
export const PostSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    imageUrl: z.url(),
    caption: z.string().optional(),
    bagSnapshot: z.array(SnapshotItemSchema),
    verifiedItemCount: z.number().default(0),
    verificationCount: z.number().default(0),
    createdAt: z.date().or(z.string()),
});
