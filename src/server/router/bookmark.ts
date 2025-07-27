import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDateFilter } from "../helper/route.helper";

export const bookmarkRouter = router({
	createBookmark: protectedProcedure.input(z.object({ eventId: z.string() })).mutation(async ({ ctx, input }) => {
		try {
			if (!ctx?.session)
				throw new TRPCError({
					message: "use is not loggedin",
					code: "UNAUTHORIZED",
				});
			const userId = ctx?.session.user.id;

			return await ctx.prisma.bookmark.create({
				data: {
					userId,
					eventId: input.eventId,
				},
			});
		} catch (error) {}
	}),

	removeBookmark: protectedProcedure.input(z.object({ eventId: z.string() })).mutation(async ({ ctx, input }) => {
		if (!ctx?.session) throw new Error("use is not loggedin");
		const userId = ctx?.session.user.id;

		return await ctx.prisma.bookmark.delete({
			where: {
				userId_eventId: {
					userId,
					eventId: input.eventId,
				},
			},
		});
	}),
	getBookmarkedEvents: protectedProcedure
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

			const bookmarks = await ctx.prisma.bookmark.findMany({
				where: {
					userId,
					...dateFilter,
				},
				take: input.limit,
				skip: (input.page - 1) * input.limit,
				include: {
					event: {
						include: {
							bookingChart: true,
							bookingDetails: true,
							bookmark: true,
						},
					},
				},
			});

			const totalPages = await ctx.prisma.bookmark.count({
				where: {
					userId,
					...dateFilter,
				},
			});

			return {
				events: bookmarks.map((bookmark) => bookmark.event),
				pagination: {
					totalPages: Math.ceil(totalPages / input.limit),
					totalEvents: totalPages,
				},
			};
		}),
});
