import { z } from "zod";
import mongoose from "mongoose";

export const userSchemaZod = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  phoneNumber: z.string().nonempty({ message: "Phone number is required" }),
  location: z.object({
    region: z.string().nonempty(),
    province: z.string().nonempty(),
    city: z.string().nonempty(),
    barangay: z.string().nonempty(),
  }),
  householdInfo: z.object({
    name: z.string().nonempty(),
    memberCount: z.number().int().nonnegative(),
    femaleCount: z.number().int().nonnegative(),
    dogCount: z.number().int().nonnegative(),
    catCount: z.number().int().nonnegative(),
  }),
  notification: z
    .object({
      email: z.boolean().default(true),
      sms: z.boolean().default(true),
    })
    .default({ email: true, sms: true }),
  role: z.string().nonempty(),
  modulePoints: z.number().int().default(0),
  goBagPoints: z.number().int().default(0),
  totalPoints: z.number().int().default(0),
  completedCoursesCount: z.number().int().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  personalGoBagId: z.instanceof(mongoose.Types.ObjectId).optional(),
  recommendedGoBagId: z.instanceof(mongoose.Types.ObjectId).optional(),
  lastViewedModuleId: z.instanceof(mongoose.Types.ObjectId).optional(),
});

export type UserInput = z.infer<typeof userSchemaZod>;
