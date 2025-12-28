import { z } from "zod";
export const RatingSchema = z.object({
    _id: z.string().optional(),
    postId: z.string(),
    raterUserId: z.string(),
    verifiedItemIds: z
        .array(z.string())
        .min(1, "You must verify at least one item."),
    createdAt: z.date().or(z.string()).optional(),
    updatedAt: z.date().or(z.string()).optional(),
});
export const CreateRatingSchema = RatingSchema.omit({
    _id: true,
    raterUserId: true,
    createdAt: true,
    updatedAt: true,
});
