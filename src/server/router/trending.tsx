import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { Prisma, EventStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import moment from "moment";
import { z } from "zod";

export const trendingRouter = router({
	getTrendingEvents: publicProcedure
		.input(
			z.object({
				isVendorSpecific: z.boolean().optional(),
				limit: z.number().default(10),
				cursor: z.string().nullish(), // Change page to cursor
				title: z.string().optional(),
				trended: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				let whereClause: Prisma.eventsWhereInput = {
					status: EventStatus.PUBLISHED,
				};

				if (input.title) {
					whereClause = {
						...whereClause,
						title: {
							contains: input.title,
							mode: "insensitive",
						},
					};
				}

				if(input.trended === true){
					whereClause = {
						...whereClause,
						trending : {
							isNot : null
						}
					}
				}else{
					whereClause = {
						...whereClause,
						trending : null
					}
				}

				if (input.isVendorSpecific && ctx.session?.user?.id) {
					whereClause = {
						...whereClause,
						vendorId: ctx.session.user.id,
					};
				}

				const trendingEvent = await ctx.prisma.events.findMany({
					where: whereClause,
					include: {
						trending: true,
						bookingChart: false,
						bookingDetails: true,
					},
					take: input.limit + 1, // +1 to check for next cursor
					cursor: input.cursor
						? {
								id: input.cursor,
							}
						: undefined,
					orderBy: {
						id: "asc", // or other unique, ordered field
					},
				});

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (trendingEvent.length > input.limit) {
					const nextItem = trendingEvent.pop();
					nextCursor = nextItem!.id;
				}

				return {
					data: trendingEvent,
					nextCursor: nextCursor,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching trending event",
					cause: error,
				});
			}
		}),

		getOnlyTrendingEvents: publicProcedure
		.input(
			z.object({
				isVendorSpecific: z.boolean().optional(),
				limit: z.number().default(10),
				cursor: z.string().nullish(),
				title: z.string().optional(),
				trended: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				// First, get only the trending event IDs
				const trendingEvents = await ctx.prisma.trending.findMany({
					select: {
						eventId: true,
					},
					take: input.limit + 1,
					cursor: input.cursor ? { eventId: input.cursor } : undefined,
					orderBy: {
						eventId: "asc",
					},
				});

				// Then, fetch only the required event data for these IDs
				const events = await ctx.prisma.events.findMany({
					where: {
						id: {
							in: trendingEvents.map(te => te.eventId)
						},
						status: EventStatus.PUBLISHED,
						...(input.title && {
							title: {
								contains: input.title,
								mode: "insensitive",
							},
						}),
					},
					select: {
						id: true,
						title: true,
						images: true,
						startDate: true,
						endDate: true,
						startingTime: true,
						endingTime: true,
						multipleDays: true,
						status: true,
						isOnline: true,
						location: true,
						landmark: true,
						city: true,
						state: true,
						country : true,
						tags: true,
						slots : true,
						bookingDetails : true,
						_count : {
							select : {
								bookingChart : true
							}
						},
					},
				});

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (trendingEvents.length > input.limit) {
					const nextItem = trendingEvents.pop();
					nextCursor = nextItem!.eventId;
				}

				return {
					data: events,
					nextCursor,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching trending events",
					cause: error,
				});
			}
		}),

	makeTrending: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.trending.create({
					data: {
						eventId: input.eventId,
						trendingBy: ctx.session?.user?.id,
					},
				});

				return {
					success: true,
				};
			} catch (error) {
				console.log(error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error making event trending",
					cause: error,
				});
			}
		}),

	removeTrending: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.trending.delete({
					where: {
						eventId: input.eventId,
					},
				});

				return {
					success: true,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error removing event from trending",
					cause: error,
				});
			}
		}),
});
