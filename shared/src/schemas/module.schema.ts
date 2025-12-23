import { z } from "zod";

export const moduleSchemaZod = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().nonempty("Description is required"),
  contentUrl: z.string().url("Content URL must be a valid URL"),
  createdAt: z.date().default(() => new Date()),
});

export type ModuleInput = z.infer<typeof moduleSchemaZod>;
