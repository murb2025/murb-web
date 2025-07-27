import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/server/db";
import { z } from "zod";
import { AccountStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
	updateUser: publicProcedure
		.input(
			z.object({
				id: z.string(),
				payload: z
					.object({
						// User table fields
						firstName: z.string().optional(),
						lastName: z.string().optional(),
						email: z.string().email().optional(),
						mobileNumber: z.string().optional(),
						avatarUrl: z.string().optional(),
						accountStatus: z.enum(["UNVERIFIED", "VERIFIED", "SUSPENDED", "PENDING"]).optional(),

						// Host table fields
						aadharNumber: z.string().optional(),
						panNumber: z.string().optional(),
						bankAccountNumber: z.string().optional(),
						ifscCode: z.string().optional(),
						gstNumber: z.string().optional(),
						govermentPhotoIdUrls: z.any().optional(),
					})
					.strict(),
			}),
		)
		.mutation(async ({ input }) => {
			const { id, payload } = input;

			try {
				// Separate user and vendor fields
				const userFields = {
					firstName: payload.firstName,
					lastName: payload.lastName,
					email: payload.email,
					mobileNumber: payload.mobileNumber,
					avatarUrl: payload.avatarUrl,
					accountStatus: payload.accountStatus as AccountStatus,
				};

				const vendorFields = {
					aadharNumber: payload?.aadharNumber || "",
					panNumber: payload?.panNumber || null,
					bankAccountNumber: payload?.bankAccountNumber || "",
					ifscCode: payload?.ifscCode || "",
					gstNumber: payload?.gstNumber || null,
					govermentPhotoIdUrls: payload?.govermentPhotoIdUrls
						? (payload.govermentPhotoIdUrls as any[]).filter((url) => url !== undefined)
						: [],
				};

				// Update both tables in a transaction
				const result = await prisma.$transaction(async (tx) => {
					// Update user table
					const updatedUser = await tx.users.update({
						where: { id },
						data: {
							...userFields,
							vendor: {
								upsert: {
									create: vendorFields,
									update: vendorFields,
								},
							},
						},
						include: {
							vendor: true,
						},
					});

					return updatedUser;
				});

				return {
					success: true,
					data: result,
					message: "Profile updated successfully",
				};
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					// Handle unique constraint violations
					if (error.code === "P2002") {
						const target = error.meta?.target as string[];
						const fieldMap: Record<string, string> = {
							mobileNumber: "Mobile number",
							aadharNumber: "Aadhar number",
							panNumber: "PAN number",
							bankAccountNumber: "Bank account number",
							gstNumber: "GST number",
							ifscCode: "IFSC code",
						};

						const field = target[0];
						const friendlyFieldName = fieldMap[field] || field;

						throw new Error(`Please try again with a different ${friendlyFieldName}`);
					}
				}

				// Handle other errors
				throw new Error(error instanceof Error ? error.message : "Failed to update profile");
			}
		}),
	checkProfileField: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx?.session?.user.id;

		try {
			const res = await ctx.prisma?.vendor.findUnique({
				where: {
					userId: userId, // Match bookings for the logged-in user
				},
			});

			if (res?.bankAccountNumber) {
				return {
					isFilled: true,
				};
			} else {
				return {
					isFilled: false,
				};
			}
		} catch (error) {
			console.error("Error in getEventById:", error);
			if (error instanceof TRPCError) throw error;
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error getting event",
				cause: error,
			});
		}
	}),
	getUser: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx?.session?.user.id;

		try {
			const res = await ctx.prisma?.users.findUnique({
				where: {
					id: userId, // Match bookings for the logged-in user
				},
				include: {
					vendor: true,
				},
			});

			// console.log(res);

			return {
				user: res,
			};
		} catch (error) {
			console.error("Error in getEventById:", error);
			if (error instanceof TRPCError) throw error;
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error getting event",
				cause: error,
			});
		}
	}),
	getUserById: protectedProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
		const userId = input.userId;

		const res = await ctx.prisma?.users.findUnique({
			where: { id: userId },
		});
		return res;
	}),

	updateBuyerProfile: protectedProcedure
		.input(
			z.object({
				firstName: z.string(),
				lastName: z.string(),
				recoveryEmail: z.string(),
				mobileNumber: z.string(),
				emergencyMobileNumber: z.string(),
				address: z.string(),
				avatarUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// const { data } = input;
			try {
				const userId = ctx?.session?.user.id;

				console.log();

				const updatedUser = await ctx.prisma?.users.update({
					where: { id: userId },
					data: {
						firstName: input.firstName,
						lastName: input.lastName,
						mobileNumber: input.mobileNumber,
						avatarUrl: input.avatarUrl,
						buyer: {
							upsert: {
								create: {
									recoveryEmail: input.recoveryEmail,
									emergencyMobileNumber: input.emergencyMobileNumber,
									address: input.address,
								},
								update: {
									recoveryEmail: input.recoveryEmail,
									emergencyMobileNumber: input.emergencyMobileNumber,
									address: input.address,
								},
							},
						},
					},
					include: {
						buyer: true,
					},
				});

				return updatedUser;
			} catch (error: any) {
				console.error("Error in updateBuyerProfile:", error);
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					// Handle unique constraint violations
					if (error.code === "P2002") {
						const target = error.meta?.target as string[];
						const fieldMap: Record<string, string> = {
							mobileNumber: "Mobile number",
							firstName: "First name",
							lastName: "Last name",
							recoveryEmail: "Recovery email",
							emergencyMobileNumber: "Emergency mobile number",
							address: "Address",
						};

						const field = target[0];
						const friendlyFieldName = fieldMap[field] || field;

						throw new Error(`Please try again with a different ${friendlyFieldName}`);
					}
				}

				// Handle other errors
				throw new Error(error instanceof Error ? error.message : "Failed to update profile");
			}
		}),

	getBuyerProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx?.session?.user.id;
		const res = await ctx.prisma?.users.findUnique({
			where: { id: userId },
			include: {
				buyer: true,
			},
		});
		return res;
	}),
});
