import { z } from "zod";

const SnapshotItemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  category: z.string(),
});

export const PostSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  lguId: z.string(),
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

export const VerifyPostSchema = z.object({
  postId: z.string(),
  verifiedItemIds: z.array(z.string()),
});

export const GetPostsQuerySchema = z.object({
  sortBy: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  limit: z.coerce.number().default(10),
  page: z.coerce.number().default(1),
  city: z.string(),
  barangay: z.string(),
});

export const CreatePostSchema = z.object({
  userId: z.string(),
  imageUrl: z.string(),
  imageId: z.string(),
  caption: z.string(),
  lguId: z.string(),
});

export type CreatePostRequest = z.infer<typeof CreatePostSchema>;
export type VerifyPostRequest = z.infer<typeof VerifyPostSchema>;
export type Post = z.infer<typeof PostSchema>;
export type FeedPost = z.infer<typeof FeedPostSchema>;
export type SnapshotItem = z.infer<typeof SnapshotItemSchema>;
export type GetPostsQuery = z.infer<typeof GetPostsQuerySchema>;
