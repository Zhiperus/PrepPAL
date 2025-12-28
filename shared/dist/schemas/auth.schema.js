import { z } from "zod";
import { PublicUserSchema } from "./user.schema.js";
const PasswordSchema = z
    .string({ error: "A password is required" })
    .min(8, { message: "The password must be at least 8 characters long." });
export const RegisterRequestSchema = z
    .object({
    email: z.email({ message: "A valid email is required." }),
    password: PasswordSchema,
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export const LoginRequestSchema = z.object({
    email: z.email({ error: "A valid email is required." }),
    password: PasswordSchema,
});
export const AuthResponseSchema = z.object({
    token: z.string(),
    user: PublicUserSchema,
});
