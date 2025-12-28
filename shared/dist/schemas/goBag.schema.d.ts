import { z } from "zod";
export declare const BagItemSchema: z.ZodObject<{
    itemId: z.ZodString;
    name: z.ZodString;
    category: z.ZodString;
    isPacked: z.ZodBoolean;
}, z.core.$strip>;
export declare const GoBagResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        name: z.ZodString;
        category: z.ZodString;
        isPacked: z.ZodBoolean;
    }, z.core.$strip>>;
    completeness: z.ZodNumber;
}, z.core.$strip>;
export type BagItem = z.infer<typeof BagItemSchema>;
