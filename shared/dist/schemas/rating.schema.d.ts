import { z } from "zod";
export declare const RatingSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    postId: z.ZodString;
    raterUserId: z.ZodString;
    verifiedItemIds: z.ZodArray<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
    updatedAt: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
}, z.core.$strip>;
export declare const CreateRatingSchema: z.ZodObject<{
    postId: z.ZodString;
    verifiedItemIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type Rating = z.infer<typeof RatingSchema>;
export type CreateRatingRequest = z.infer<typeof CreateRatingSchema>;
