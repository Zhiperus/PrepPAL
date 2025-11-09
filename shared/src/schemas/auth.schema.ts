import { z } from "zod";

const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." });

export const RegisterRequestSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: PasswordSchema,
});

export const LoginRequestSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
