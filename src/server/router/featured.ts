import { router, publicProcedure } from "@/server/trpc";
import moment from "moment";
import { z } from "zod";

export const featuredRouter = router({
	getFeaturedEvents: publicProcedure
		.input(z.object({ limit: z.number().default(10), offset: z.number() }))
		.query(async ({ ctx, input }) => {
			const featuredEvents = await ctx.prisma.featured.findMany({
				where: {
					event: {
						status: "PUBLISHED",
						OR: [
							{
								multipleDays: true,
								endDate: {
									gte: new Date().toISOString().split("T")[0],
								},
							},
							{
								multipleDays: false,
								startDate: {
									gte: new Date().toISOString().split("T")[0],
								},
							},
						],
					},
				},
				take: input.limit,
				skip: input.offset,
				select: {
					event: {
						select: {
							id: true,
							title: true,
							images: true,
							startDate: true,
							endDate: true,
							startingTime: true,
							endingTime: true,
							multipleDays: true,
							isOnline: true,
							location: true,
							landmark: true,
							city: true,
							state: true,
							country : true,
							tags: true,
							slots : true,
							_count : {
								select : {
									bookingChart : true
								}
							},
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return featuredEvents.map(({ event }) => ({
				id: event.id,
				tags: event.tags,
				title: event.title,
				images: event.images,
				isOnline: event.isOnline,
				time: `${event.startingTime || ""} - ${event.endingTime || ""}`,
				date: event.multipleDays
					? moment(event.startDate).format("DD MMM,YYYY") +
						" to " +
						moment(event.endDate).format("DD MMM,YYYY")
					: moment(event.startDate).format("DD MMM,YYYY"),
				ticketLeft: 10,
				location: event.isOnline
					? "Online event"
					: `${event.landmark}, ${event.city}, ${event.state}, ${event.country}`,
			}));
		}),
});
