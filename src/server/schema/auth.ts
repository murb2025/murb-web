// src/server/auth/auth.schema.ts
import { z } from "zod";

export const createOtpSchema = z
	.object({
		email: z.string().email().optional(),
		mobileNumber: z.string().optional(),
		type: z.enum(["LOGIN", "CREATE_ACCOUNT"]),
		method: z.enum(["email", "mobile"]),
		role: z.enum(["VENDOR", "BUYER", "ADMIN"]),
	})
	.refine((data) => data.email || data.mobileNumber, {
		message: "Either email or mobile number must be provided",
	});

export const verifyOtpSchema = z
	.object({
		email: z.string().email().optional(),
		mobileNumber: z.string().optional(),
		otp: z.string().length(6),
		role: z.any(),
	})
	.refine((data) => data.email || data.mobileNumber, {
		message: "Either email or mobile number must be provided",
	});

export const refreshTokenSchema = z.object({
	refreshToken: z.string(),
});

// Types based on schemas
export type CreateOtpInput = z.infer<typeof createOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
