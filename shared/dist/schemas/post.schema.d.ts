import { z } from "zod";
declare const SnapshotItemSchema: z.ZodObject<{
    itemId: z.ZodString;
    name: z.ZodString;
    category: z.ZodString;
}, z.core.$strip>;
export declare const PostSchema: z.ZodObject<{
    _id: z.ZodString;
    userId: z.ZodString;
    imageUrl: z.ZodURL;
    caption: z.ZodOptional<z.ZodString>;
    bagSnapshot: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        name: z.ZodString;
        category: z.ZodString;
    }, z.core.$strip>>;
    verifiedItemCount: z.ZodDefault<z.ZodNumber>;
    verificationCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodUnion<[z.ZodDate, z.ZodString]>;
}, z.core.$strip>;
export type Post = z.infer<typeof PostSchema>;
export type SnapshotItem = z.infer<typeof SnapshotItemSchema>;
export {};
