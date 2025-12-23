import { z } from "zod";
import { PublicUserSchema } from "./user.schema";

const PasswordSchema = z
  .string({ error: "A password is required" })
  .min(8, { message: "The password must be at least 8 characters long." });

export const RegisterRequestSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: PasswordSchema,
});

export const LoginRequestSchema = z.object({
  email: z.email({ error: "A valid email is required." }),
  password: PasswordSchema,
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: PublicUserSchema,
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
