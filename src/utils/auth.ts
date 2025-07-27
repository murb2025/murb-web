// auth-utils.ts
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret";

export const createOtpSchema = z.object({
	email: z.string().email().optional(),
	mobileNumber: z.string().optional(),
	type: z.enum(["LOGIN", "CREATE_ACCOUNT"]),
	method: z.enum(["email", "mobile"]),
	role: z.string(),
});

export const verifyOtpSchema = z.object({
	email: z.string().email().optional(),
	mobileNumber: z.string().optional(),
	otp: z.string(),
	role: z.string(),
});

export type TokenPayload = {
	id: string;
	email: string | null;
	role: string;
};

export const generateOtp = (): string => {
	return crypto.randomInt(100000, 999999).toString();
};

export const createTokens = (payload: TokenPayload) => {
	const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });
	const refreshToken = jwt.sign({ ...payload, isRefreshToken: true }, REFRESH_SECRET, { expiresIn: "15d" });
	return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
	try {
		return jwt.verify(token, JWT_SECRET) as TokenPayload;
	} catch (error) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid or expired access token",
		});
	}
};

export const verifyRefreshToken = (token: string): TokenPayload & { isRefreshToken: true } => {
	try {
		const payload = jwt.verify(token, REFRESH_SECRET) as TokenPayload & {
			isRefreshToken: true;
		};
		if (!payload.isRefreshToken) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid refresh token",
			});
		}
		return payload;
	} catch (error) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid or expired refresh token",
		});
	}
};
