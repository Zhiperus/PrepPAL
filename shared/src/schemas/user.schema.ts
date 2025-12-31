import { z } from "zod";

const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." });

const LocationSchema = z.object({
  region: z.string().min(1, { message: "Region is required." }),
  province: z.string().min(1, { message: "Province is required." }),
  city: z.string().min(1, { message: "City is required." }),
  barangay: z.string().min(1, { message: "Barangay is required." }),
});

const HouseholdSchema = z.object({
  memberCount: z
    .number()
    .int()
    .min(1, { message: "At least one member is required." }),
  femaleCount: z.number().int().min(0),
  dogCount: z.number().int().min(0),
  catCount: z.number().int().min(0),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.email({ error: "A valid email is required." }),
  password: z.string(),
  householdName: z.string(),
  location: LocationSchema.optional(),
  householdInfo: HouseholdSchema.optional(),
  phoneNumber: z.string().nonempty({ message: "Phone number is required" }),
  onboardingCompleted: z.boolean().default(false),
  role: z.enum(["citizen", "lgu"]).default("citizen"),
  notification: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  points: z.object({
    goBag: z.number().default(0),
    modules: z.number().default(0),
    community: z.number().default(0),
  }),
  profileImage: z.url().optional(),
  profileImageId: z.string().optional(),
  isEmailVerified: z.boolean(),
  verificationToken: z.string(),
  verificationTokenExpires: z.date(),
  resetPasswordToken: z.string(),
  resetPasswordExpires: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PublicUserSchema = UserSchema.omit({
  password: true,
  verificationToken: true,
  verificationTokenExpires: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
});

export const RegisterRequestSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: PasswordSchema,
});

export const LoginRequestSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: z.string(),
});

export const OnboardingRequestSchema = z.object({
  location: LocationSchema,
  householdInfo: HouseholdSchema,
  householdName: z.string().min(1, "Household Name is required"),
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, "Must be a valid format (e.g., 09123456789)"),

  emailConsent: z.boolean().optional(),
});

export const UpdateProfileInfoRequestSchema = z
  .object({
    notification: z
      .object({
        email: z.boolean(),
        sms: z.boolean(),
      })
      .partial(),

    householdName: z.string().min(1, "Household Name is required"),
    householdInfo: HouseholdSchema.partial(),
  })
  .partial();

export const GetLeaderboardQuerySchema = z.object({
  sortBy: z
    .enum(["points.goBag", "points.community", "points.modules", "totalPoints"])
    .default("points.goBag"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().default(10),
  page: z.coerce.number().default(1),

  region: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  barangay: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;

export type UpdateProfileInfoRequest = z.infer<
  typeof UpdateProfileInfoRequestSchema
>;

export type GetLeaderboardQuery = z.infer<typeof GetLeaderboardQuerySchema>;

export type User = z.infer<typeof PublicUserSchema>;
