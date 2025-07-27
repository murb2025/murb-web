import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDateFilter } from "../helper/route.helper";

export const notificationRouter = router({
	createNotification: protectedProcedure
		.input(z.object({ message: z.string(), link: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			try {
				if (!ctx?.session)
					throw new TRPCError({
						message: "use is not loggedin",
						code: "UNAUTHORIZED",
					});
				const userId = ctx?.session.user.id;

				return await ctx.prisma.notifications.create({
					data: {
						userId,
						message: input.message,
						link: input.link,
					},
				});
			} catch (error) {}
		}),

	getNotifications: protectedProcedure
		.input(
			z.object({
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
				page: z.number().default(1),
				limit: z.number().default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!ctx?.session) {
				throw new TRPCError({
					message: "User is not logged in",
					code: "UNAUTHORIZED",
				});
			}

			const userId = ctx.session.user.id;

			let dateFilter = getDateFilter(input.timeFilter);

			const notifications = await ctx.prisma.notifications.findMany({
				where: {
					userId,
					...dateFilter,
				},
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				include: {
					user: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			const totalPages = await ctx.prisma.notifications.count({
				where: {
					userId,
					...dateFilter,
				},
			});

			return {
				notifications,
				pagination: {
					totalPages: Math.ceil(totalPages / input.limit),
					totalNotifications: totalPages,
				},
			};
		}),

	markAsRead: protectedProcedure.input(z.object({ notificationId: z.string() })).mutation(async ({ ctx, input }) => {
		if (!ctx?.session) {
			throw new TRPCError({
				message: "User is not logged in",
				code: "UNAUTHORIZED",
			});
		}

		const userId = ctx.session.user.id;

		return await ctx.prisma.notifications.update({
			where: { id: input.notificationId, userId },
			data: { isRead: true },
		});
	}),

	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx?.session) {
			throw new TRPCError({
				message: "User is not logged in",
				code: "UNAUTHORIZED",
			});
		}

		const userId = ctx.session.user.id;

		return await ctx.prisma.notifications.updateMany({
			where: { userId },
			data: { isRead: true },
		});
	}),

	isNewNotification: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx?.session) {
			throw new TRPCError({
				message: "User is not logged in",
				code: "UNAUTHORIZED",
			});
		}

		const userId = ctx.session.user.id;

		const notification = await ctx.prisma.notifications.findFirst({
			where: { userId, isRead: false },
		});

		return notification ? true : false;
	}),
});
