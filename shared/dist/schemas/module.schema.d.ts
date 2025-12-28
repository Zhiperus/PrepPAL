import { z } from "zod";
export declare const moduleSchemaZod: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    contentUrl: z.ZodString;
    createdAt: z.ZodDefault<z.ZodDate>;
}, z.core.$strip>;
export type ModuleInput = z.infer<typeof moduleSchemaZod>;
