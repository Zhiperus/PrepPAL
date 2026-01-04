import { z } from "zod";

export const contentSchemaZod = z.object({
  imageUrl: z.url("Must be a valid URL").optional().nullable(),
  text: z.string().min(1, "Text is required"),
  reference: z.string().optional(),
  referenceUrl: z.url("Reference URL must be valid").optional().nullable(),
});

export const moduleSchemaZod = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  logo: z.string().min(1, "Logo icon key is required"),
  content: z.array(contentSchemaZod),
  createdAt: z.date().default(() => new Date()),
});

export type Module = z.infer<typeof moduleSchemaZod>;
export type Content = z.infer<typeof contentSchemaZod>;
