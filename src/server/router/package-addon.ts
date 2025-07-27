import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const promotionRouter = router({
	createPromotionPackage: publicProcedure
		.input(
			z.object({
				packageName: z.string(),
				packageDescription: z.array(
					z.object({
						title: z.string(),
						description: z.string(),
					}),
				),
				packagePrice: z.number(),
				packageCurrency: z.string().default("INR"),
				packageDuration: z.number(), // Duration in days
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const newPackage = await ctx.prisma.event_promotion_packages.create({
					data: {
						packageName: input.packageName,
						packageDescription: input.packageDescription,
						packagePrice: input.packagePrice,
						packageCurrency: input.packageCurrency,
						packageDuration: input.packageDuration,
					},
				});

				return {
					success: true,
					data: newPackage,
					message: "Promotion package created successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating promotion package",
					cause: error,
				});
			}
		}),
	createAddonPackage: publicProcedure
		.input(
			z.object({
				title: z.string(),
				description: z.string(),
				price: z.number(),
				currency: z.string().default("INR"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const newPackage = await ctx.prisma.event_addon_packages.create({
					data: {
						title: input.title,
						description: input.description,
						price: input.price,
						currency: input.currency,
					},
				});

				return {
					success: true,
					data: newPackage,
					message: "Promotion package created successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating promotion package",
					cause: error,
				});
			}
		}),

	getPromotionPackages: publicProcedure
		.input(
			z
				.object({
					page: z.number().default(1),
					limit: z.number().default(10),
					sortBy: z.string().default("packagePrice"),
					sortOrder: z.enum(["asc", "desc"]).default("asc"),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			try {
				const skip = input ? (input.page - 1) * input.limit : 0;
				const take = input?.limit || 10;

				const [packages, total] = await Promise.all([
					ctx.prisma.event_promotion_packages.findMany({
						skip,
						take,
						orderBy: {
							[input?.sortBy || "packagePrice"]: input?.sortOrder || "asc",
						},
					}),
					ctx.prisma.event_promotion_packages.count(),
				]);

				return {
					data: packages,
					pagination: {
						total,
						pages: Math.ceil(total / take),
						page: input?.page || 1,
						limit: take,
					},
					message: "Promotion packages fetched successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching promotion packages",
					cause: error,
				});
			}
		}),

	getAddonPayments: protectedProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				title: z.string().optional(),
				isUserSpecific: z.boolean().optional(),
				status: z.enum(["SUCCESS"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				let whereClause: any = {};

				if (input.status === "SUCCESS") {
					whereClause = {
						...whereClause,
						status: "SUCCESS",
					};
				}
				if (input.isUserSpecific && ctx.session?.user?.id) {
					whereClause = {
						...whereClause,
						userId: ctx.session.user.id,
					};
				}

				if (input.title) {
					whereClause = {
						...whereClause,
						OR: [
							{
								event: {
									title: {
										contains: input.title,
										mode: "insensitive",
									},
								},
							},
							{
								user: {
									OR: [
										{
											firstName: {
												contains: input.title,
												mode: "insensitive",
											},
										},
										{
											lastName: {
												contains: input.title,
												mode: "insensitive",
											},
										},
									],
								},
							},
						],
					};
				}

				const promotedEvent = await ctx.prisma.addonPayment.findMany({
					where: whereClause,
					include: {
						event: {
							include: {
								bookingChart: true,
								bookingDetails: true,
								bookings: true,
								featured: true,
								promotionPayment: true,
							},
						},
						user: true,
						event_addon_packages: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				const count = await ctx.prisma.addonPayment.count({
					where: whereClause,
				});

				return {
					data: promotedEvent.map((event) => ({
						id: event.id,
						eventName: event.event.title,
						vendorName: event?.user.firstName
							? event.user.firstName + " " + (event.user.lastName ?? "")
							: "",
						avatarUrl: event.user.avatarUrl,
						email: event.user.email,
						date: event.createdAt,
						amount: event.totalAmount,
						paymentId: event.paymentId,
						status: event.status,
						addonDetail: event.event_addon_packages?.title,
					})),
					pagination: {
						total: Math.ceil(count / input.limit),
						page: input.page,
						limit: input.limit,
					},
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching promoted event",
					cause: error,
				});
			}
		}),

	getPackagePayments: protectedProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				title: z.string().optional(),
				isUserSpecific: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				let whereClause: any = {};

				if (input.isUserSpecific && ctx.session?.user?.id) {
					whereClause = {
						...whereClause,
						userId: ctx.session.user.id,
					};
				}

				if (input.title) {
					whereClause = {
						...whereClause,
						OR: [
							{
								event: {
									title: {
										contains: input.title,
										mode: "insensitive",
									},
								},
							},
							{
								user: {
									OR: [
										{
											firstName: {
												contains: input.title,
												mode: "insensitive",
											},
										},
										{
											lastName: {
												contains: input.title,
												mode: "insensitive",
											},
										},
									],
								},
							},
						],
					};
				}

				const promotedEvent = await ctx.prisma.promotionPayment.findMany({
					where: whereClause,
					include: {
						event: {
							include: {
								bookingChart: true,
								bookingDetails: true,
								bookings: true,
								featured: true,
								promotionPayment: true,
							},
						},
						user: true,
						event_promotion_packages: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				const count = await ctx.prisma.promotionPayment.count({
					where: whereClause,
				});

				return {
					data: promotedEvent.map((event) => ({
						id: event.id,
						eventName: event.event.title,
						vendorName: event?.user.firstName
							? event.user.firstName + " " + (event.user.lastName ?? "")
							: "",
						avatarUrl: event.user.avatarUrl,
						email: event.user.email,
						date: event.createdAt,
						amount: event.totalAmount,
						paymentId: event.paymentId,
						status: event.status,
						packageDetail: event.event_promotion_packages?.packageName,
					})),
					pagination: {
						total: Math.ceil(count / input.limit),
						page: input.page,
						limit: input.limit,
					},
				};
			} catch (error) {
				console.log(error);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching promoted event",
					cause: error,
				});
			}
		}),

	getAddonPackages: publicProcedure
		.input(
			z
				.object({
					page: z.number().default(1),
					limit: z.number().default(10),
					sortBy: z.string().default("packagePrice"),
					sortOrder: z.enum(["asc", "desc"]).default("asc"),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			try {
				const skip = input ? (input.page - 1) * input.limit : 0;
				const take = input?.limit || 10;

				const [packages, total] = await Promise.all([
					ctx.prisma.event_addon_packages.findMany({
						skip,
						take,
						orderBy: {
							[input?.sortBy || "packagePrice"]: input?.sortOrder || "asc",
						},
					}),
					ctx.prisma.event_addon_packages.count(),
				]);

				return {
					data: packages,
					pagination: {
						total,
						pages: Math.ceil(total / take),
						page: input?.page || 1,
						limit: take,
					},
					message: "Addon packages fetched successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching addon packages",
					cause: error,
				});
			}
		}),

	getPromotedEventById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		try {
			const promotedEvent = await ctx.prisma.promotionPayment.findFirst({
				where: {
					id: input.id,
				},
				include: {
					event_promotion_packages: true,
					user: true,
					event: {
						include: {
							bookingChart: true,
							bookingDetails: true,
							bookings: true,
							featured: true,
							promotionPayment: true,
						},
					},
				},
			});

			return promotedEvent;
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error fetching promoted event",
				cause: error,
			});
		}
	}),

	getPromotedEvents: protectedProcedure
		.input(
			z.object({
				isVendorSpecific: z.boolean().optional(),
				cursor: z.string().nullish(),
				limit: z.number().default(10),
				title: z.string().optional(),
				featured: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { cursor, limit, title, featured, isVendorSpecific } = input;
			try {
				let whereClause: any = {
					// status: "SUCCESS",
				};

				if (title) {
					whereClause = {
						...whereClause,

						title: {
							contains: title,
							mode: "insensitive",
						},
					};
				}

				if (featured) {
					whereClause = {
						...whereClause,
						featured: {
							isNot: null,
						},
					};
				}
				if (featured !== undefined && featured === false) {
					whereClause = {
						...whereClause,
						featured: null,
					};
				}

				if (isVendorSpecific && ctx.session?.user?.id) {
					whereClause = {
						...whereClause,
						vendorId: ctx.session.user.id,
					};
				}

				const promotedEvent = await ctx.prisma.events.findMany({
					where: { ...whereClause },
					include: {
						bookingChart: true,
						bookingDetails: true,
						bookings: true,
						featured: true,
						promotionPayment: true,
					},
					cursor: input.cursor ? { id: input.cursor } : undefined,
					take: input.limit + 1,
				});

				let nextCursor: typeof cursor | undefined = undefined;
				if (promotedEvent.length > limit) {
					const nextItem = promotedEvent.pop();
					nextCursor = nextItem!.id;
				}

				return {
					data: promotedEvent,
					nextCursor,
				};
			} catch (error) {
				console.log(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching promoted event",
					cause: error,
				});
			}
		}),

	updatePromotionPackage: publicProcedure
		.input(
			z.object({
				id: z.string(),
				packageName: z.string(),
				packageDescription: z.array(
					z.object({
						title: z.string(),
						description: z.string(),
					}),
				),
				packagePrice: z.number(),
				packageCurrency: z.string().default("INR"),
				packageDuration: z.number(), // Duration in days
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedPackage = await ctx.prisma.event_promotion_packages.update({
					where: {
						id: input.id,
					},
					data: {
						packageName: input.packageName,
						packageDescription: input.packageDescription,
						packagePrice: input.packagePrice,
						packageCurrency: input.packageCurrency,
						packageDuration: input.packageDuration,
					},
				});

				return {
					success: true,
					data: updatedPackage,
					message: "Promotion package updated successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating promotion package",
					cause: error,
				});
			}
		}),

	deletePromotionPackage: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
		try {
			const deletedPackage = await ctx.prisma.event_promotion_packages.delete({
				where: {
					id: input.id,
				},
			});

			return {
				success: true,
				data: deletedPackage,
				message: "Promotion package deleted successfully",
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error deleting promotion package",
				cause: error,
			});
		}
	}),

	updateAddonPackage: publicProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string(),
				price: z.number(),
				currency: z.string().default("INR"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedPackage = await ctx.prisma.event_addon_packages.update({
					where: {
						id: input.id,
					},
					data: {
						title: input.title,
						description: input.description,
						price: input.price,
						currency: input.currency,
					},
				});

				return {
					success: true,
					data: updatedPackage,
					message: "Addon package updated successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating addon package",
					cause: error,
				});
			}
		}),

	deleteAddonPackage: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
		try {
			const deletedPackage = await ctx.prisma.event_addon_packages.delete({
				where: {
					id: input.id,
				},
			});

			return {
				success: true,
				data: deletedPackage,
				message: "Addon package deleted successfully",
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error deleting addon package",
				cause: error,
			});
		}
	}),
});
