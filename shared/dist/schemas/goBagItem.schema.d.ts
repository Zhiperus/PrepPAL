import { z } from "zod";
export declare const GoBagItemSchema: z.ZodObject<{
    _id: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<{
        food: "food";
        water: "water";
        hygiene: "hygiene";
        "first-aid": "first-aid";
        tools: "tools";
        tech: "tech";
        clothing: "clothing";
    }>;
    defaultQuantity: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type GoBagItem = z.infer<typeof GoBagItemSchema>;
