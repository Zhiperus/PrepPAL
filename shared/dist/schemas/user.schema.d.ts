import { z } from "zod";
export declare const UserSchema: z.ZodObject<{
    _id: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    householdName: z.ZodString;
    location: z.ZodOptional<z.ZodObject<{
        region: z.ZodString;
        province: z.ZodString;
        city: z.ZodString;
        barangay: z.ZodString;
    }, z.core.$strip>>;
    householdInfo: z.ZodOptional<z.ZodObject<{
        memberCount: z.ZodNumber;
        femaleCount: z.ZodNumber;
        dogCount: z.ZodNumber;
        catCount: z.ZodNumber;
    }, z.core.$strip>>;
    phoneNumber: z.ZodString;
    onboardingCompleted: z.ZodDefault<z.ZodBoolean>;
    role: z.ZodDefault<z.ZodEnum<{
        citizen: "citizen";
        lgu: "lgu";
    }>>;
    notification: z.ZodObject<{
        email: z.ZodDefault<z.ZodBoolean>;
        sms: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    points: z.ZodObject<{
        goBag: z.ZodDefault<z.ZodNumber>;
        modules: z.ZodDefault<z.ZodNumber>;
        community: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    isEmailVerified: z.ZodBoolean;
    verificationToken: z.ZodString;
    verificationTokenExpires: z.ZodDate;
    resetPasswordToken: z.ZodString;
    resetPasswordExpires: z.ZodDate;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const PublicUserSchema: z.ZodObject<{
    _id: z.ZodString;
    email: z.ZodEmail;
    householdName: z.ZodString;
    location: z.ZodOptional<z.ZodObject<{
        region: z.ZodString;
        province: z.ZodString;
        city: z.ZodString;
        barangay: z.ZodString;
    }, z.core.$strip>>;
    householdInfo: z.ZodOptional<z.ZodObject<{
        memberCount: z.ZodNumber;
        femaleCount: z.ZodNumber;
        dogCount: z.ZodNumber;
        catCount: z.ZodNumber;
    }, z.core.$strip>>;
    phoneNumber: z.ZodString;
    onboardingCompleted: z.ZodDefault<z.ZodBoolean>;
    role: z.ZodDefault<z.ZodEnum<{
        citizen: "citizen";
        lgu: "lgu";
    }>>;
    notification: z.ZodObject<{
        email: z.ZodDefault<z.ZodBoolean>;
        sms: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    points: z.ZodObject<{
        goBag: z.ZodDefault<z.ZodNumber>;
        modules: z.ZodDefault<z.ZodNumber>;
        community: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    isEmailVerified: z.ZodBoolean;
    verificationToken: z.ZodString;
    verificationTokenExpires: z.ZodDate;
    resetPasswordToken: z.ZodString;
    resetPasswordExpires: z.ZodDate;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const OnboardingRequestSchema: z.ZodObject<{
    location: z.ZodObject<{
        region: z.ZodString;
        province: z.ZodString;
        city: z.ZodString;
        barangay: z.ZodString;
    }, z.core.$strip>;
    householdInfo: z.ZodObject<{
        memberCount: z.ZodNumber;
        femaleCount: z.ZodNumber;
        dogCount: z.ZodNumber;
        catCount: z.ZodNumber;
    }, z.core.$strip>;
    householdName: z.ZodString;
    phoneNumber: z.ZodString;
    emailConsent: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type User = z.infer<typeof PublicUserSchema>;
