import { TRPCError } from "@trpc/server";
import { createOtpSchema, verifyOtpSchema } from "@/server/schema/auth";
import crypto from "crypto";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { emailRouter } from "@/server/router/email";
import { signOut } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOption";

export const authRouter = router({
	createOtp: publicProcedure.input(createOtpSchema).mutation(async ({ input, ctx }) => {
		const { email, mobileNumber, type } = input;

		const existingUser = await ctx?.prisma?.users.findFirst({
			where: {
				OR: [{ email: email ?? undefined }, { mobileNumber: mobileNumber ?? undefined }],
			},
		});

		if (existingUser?.accountStatus === "SUSPENDED") {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User account is suspended. Please contact support.",
			});
		}

		if (type === "LOGIN" && !existingUser) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "User does not exist. Please create an account.",
			});
		}

		if (type === "CREATE_ACCOUNT" && existingUser) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "User already exists. Please login instead.",
			});
		}

		const otp = crypto.randomInt(100000, 999999).toString();
		const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

		const existingOtp = await ctx.prisma?.otps.findFirst({
			where: {
				email: email, // Ensure email is defined
			},
		});

		if (existingOtp) {
			// Update the existing OTP if it exists
			await ctx.prisma?.otps.update({
				where: {
					id: existingOtp.id, // Ensure email is defined
				},
				data: {
					otp: otp,
					expiresAt: otpExpiresAt,
					updatedAt: new Date(),
				},
			});
		} else {
			// Create a new OTP if it doesn't exist
			await ctx.prisma?.otps.create({
				data: {
					email: email ?? "", // Ensure email is defined
					otp: otp,
					expiresAt: otpExpiresAt,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
		}

		try {
			await emailRouter.createCaller(ctx).sendOtpEmail({
				email,
				otp,
				expiresAt: otpExpiresAt,
			});
		} catch (error) {
			console.error("Error sending OTP email:", error);
		}

		// console.log("otpExpiresAt: ", otpExpiresAt);

		return {
			expiresAt: otpExpiresAt,
			newUser: type === "CREATE_ACCOUNT" || !existingUser,
		};
	}),

	verifyOtp: publicProcedure.input(verifyOtpSchema).mutation(async ({ input, ctx }) => {
		const { email, mobileNumber, otp, role } = input;

		// console.log(role);

		const validOtp = await ctx.prisma?.otps.findFirst({
			where: {
				OR: [
					{ email, otp },
					{ mobileNumber, otp },
				],
			},
		});

		if (!validOtp) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Invalid or expired OTP",
			});
		}

		let user;

		user = await ctx.prisma?.users.findFirst({
			where: {
				OR: [{ email }, { mobileNumber }],
			},
		});

		if (!user) {
			user = await ctx?.prisma?.users.create({
				data: {
					email: email,
					role: role.toUpperCase(),
				},
			});
		}

		// Delete the used OTP
		await ctx?.prisma?.otps.delete({ where: { id: validOtp.id } });

		return user;
	}),

	logout: protectedProcedure.mutation(async () => {
		await signOut({ redirect: false });
		return { success: true };
	}),

	getMe: publicProcedure.query(async () => {
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Not authenticated",
			});
		}

		return { user: session.user };
	}),
});
