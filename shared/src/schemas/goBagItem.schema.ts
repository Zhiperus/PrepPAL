import { z } from "zod";

const applicableIfSchema = z.object({
  hasFemale: z.boolean(),
  hasDog: z.boolean(),
  hasCat: z.boolean(),
});

export const goBagItemSchemaZod = z.object({
  name: z.string().nonempty("Name is required"),
  category: z.string().nonempty("Category is required"),
  scoreWeight: z.number(),
  description: z.string().nonempty("Description is required"),
  applicableIf: applicableIfSchema,
});

export type GoBagItemInput = z.infer<typeof goBagItemSchemaZod>;
