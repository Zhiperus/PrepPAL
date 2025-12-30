import { z } from "zod";

const SnapshotItemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  category: z.string(),
});

export const PostSchema = z.object({
  _id: z.string(),
  userId: z.string(), // Just the ID
  imageUrl: z.url(),
  imageId: z.string().optional(),
  caption: z.string().optional(),
  bagSnapshot: z.array(SnapshotItemSchema),
  verifiedItemCount: z.number().default(0),
  verificationCount: z.number().default(0),
  createdAt: z.date().or(z.string()),
});

export const FeedPostSchema = PostSchema.extend({
  author: z.object({
    name: z.string(),
    userImage: z.string().optional(),
    rank: z.number().default(1),
  }),
});

export type Post = z.infer<typeof PostSchema>;
export type FeedPost = z.infer<typeof FeedPostSchema>;
export type SnapshotItem = z.infer<typeof SnapshotItemSchema>;

