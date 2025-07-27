import { adminProcedure, protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { calculateTotalTickets, getDateFilter } from "../helper/route.helper";
import { sendWhatsAppMessage } from "./wa-notifier";
import { IBooking } from "@/types/booking.type";

export const adminRouter = router({
	updatePercentageShare: protectedProcedure
		.input(
			z.object({
				vendorId: z.string(),
				percentageCut: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedUser = await ctx.prisma.users.update({
					where: { id: input.vendorId },
					data: {
						vendor: {
							update: {
								percentageCut: Number(input.percentageCut),
							},
						},
					},
					include: {
						vendor: true,
					},
				});
			} catch (error) {
				console.error("Error in Admin:", error);
				throw error;
			}
		}),
	getEvents: adminProcedure
		.input(
			z.object({
				cursor: z.string().nullish(),
				limit: z.number().default(10),
				sortBy: z.string().default("createdAt"),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),

				title: z.string().optional(),
				status: z.enum(["PENDING", "PUBLISHED", "UNPUBLISHED"]).optional(),
				visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),

				location: z.string().optional(),
				landmark: z.string().optional(),
				city: z.string().optional(),
				state: z.string().optional(),
				country: z.string().optional(),
				pincode: z.string().optional(),

				vendorId: z.number().optional(),

				isOnline: z.boolean().optional(),

				eventSpecificType: z.string().optional(),
				sportName: z.string().optional(),
				tag: z.string().optional(),

				from: z.string().optional(),
				to: z.string().optional(),

				featured: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// console.log("Search Input:", input);

			const { cursor, limit = 2, sortBy = "createdAt", sortOrder = "DESC", timeFilter, ...filters } = input;

			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);

			// Always include vendorId in where clause
			let where: any = {
				...dateFilter,
				...(filters.status && { status: filters.status }),
				...(filters.visibility && { visibility: filters.visibility }),
				...(filters.location && { visibility: filters.location }),
				...(filters.landmark && { visibility: filters.landmark }),
				...(filters.city && { visibility: filters.city }),
				...(filters.state && { visibility: filters.state }),
				...(filters.country && { visibility: filters.country }),
				...(filters.pincode && { visibility: filters.pincode }),
				...(filters.vendorId && { visibility: filters.vendorId }),
				...(filters.isOnline && { isOnline: filters.isOnline }),
			};

			if (input.featured) {
				where = {
					...where,
					featured: {
						isNot: null,
					},
				};
			}
			if (input.featured !== undefined && input.featured === false) {
				where = {
					...where,
					featured: null,
				};
			}

			if (filters.from && filters.to) {
				where = {
					...where,
					createdAt: {
						gte: new Date(filters.from),
						lt: new Date(filters.to),
					},
				};
			}

			if (filters.eventSpecificType !== undefined && !["all", ""].includes(filters.eventSpecificType)) {
				where = {
					...where,
					eventSpecificType: filters.eventSpecificType,
				};
			}

			if (filters.sportName !== undefined && !["all", ""].includes(filters.sportName)) {
				where = {
					...where,
					sportName: filters.sportName,
				};
			}

			if (filters.tag) {
				where = {
					...where,
					tags: {
						contains: filters.tag,
						mode: "insensitive",
					},
				};
			}

			// If title is provided, search in both title and tags
			if (filters.title) {
				const searchTerm = filters.title.toLowerCase();
				where.OR = [
					{
						title: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
					{
						tags: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				];
			}

			// console.log("Final where clause:", JSON.stringify(where, null, 2));

			try {
				const events = await ctx.prisma?.events.findMany({
					take: limit + 1,
					where,
					cursor: cursor ? { id: cursor } : undefined,
					orderBy: { [sortBy]: sortOrder.toLowerCase() },
					include: {
						bookingDetails: true,
						bookingChart: true,
						promotionPayment: true,
						featured: true,
						users: {
							select: {
								id: true,
								username: true,
								firstName: true,
								lastName: true,
								email: true,
								avatarUrl: true,
							},
						},
						reviews: {
							select: {
								rating: true,
								comment: true,
								createdAt: true,
							},
						},
					},
				});

				let nextCursor: typeof cursor | undefined = undefined;
				if (events.length > limit) {
					const nextItem = events.pop();
					nextCursor = nextItem!.id;
				}

				// console.log("Found events count:", events?.length);
				// console.log("Total matching events:", total);

				// Calculate average rating for each event
				const eventsWithRating = events?.map((event) => ({
					...event,
					averageRating: event.reviews.length
						? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length
						: null,
				}));

				return {
					events: eventsWithRating,
					nextCursor,
				};
			} catch (error) {
				console.error("Error in getEvents:", error);
				throw error;
			}
		}),
	getTopEvents: adminProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				sortBy: z.string().default("createdAt"),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),

				status: z.enum(["PENDING", "PUBLISHED", "UNPUBLISHED"]).optional(),
				visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// console.log("Search Input:", input);

			const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC", timeFilter, ...filters } = input;

			const skip = (page - 1) * limit;

			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);

			// Always include vendorId in where clause
			let where: any = {
				...dateFilter,
				...(filters.status && { status: filters.status }),
				...(filters.visibility && { visibility: filters.visibility }),
			};

			where = {
				...where,
			};
			// console.log("Final where clause:", JSON.stringify(where, null, 2));

			try {
				const events = await ctx.prisma?.events.findMany({
					where,
					include: {
						bookings: true, // Fetch all event-related data
					},
					skip,
					take: limit,
					orderBy: [
						{ bookings: { _count: "desc" } }, // Prioritize high participation events
						// { reviews: { _avg: { rating: 'desc' } } }, // Then sort by average rating
					],
				});

				const response = {
					events: events.map((event) => {
						const finalBookings = event.bookings.filter((booking) => booking.status === "SUCCESS");
						const ticketSum = calculateTotalTickets(finalBookings as unknown as IBooking[]);
						// return sum + Number(ticketSum);
						const totalRevenue = finalBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

						return {
							title: event.title,
							totalTickets: ticketSum,
							totalRevenue,
							multipleDays: event.multipleDays,
							startDate: event.startDate,
							endDate: event.endDate,
							eventType: event.eventSpecificType,
						};
					}), // Sum total tickets
				};

				// console.log("get total event", response);

				return response;
			} catch (error) {
				console.error("Error in getEvents:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error getting top events",
					cause: error,
				});
			}
		}),
	getTopVendor: adminProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				sortBy: z.string().default("createdAt"),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),

				accountStatus: z.enum(["ALL", "VERIFIED", "UNVERIFIED", "SUSPENDED"]).optional(),
				searchText: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// console.log("Search Input:", input);

			const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC", timeFilter, ...filters } = input;

			const skip = (page - 1) * limit;

			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);

			// Always include vendorId in where clause
			let where = {
				...dateFilter,
			};

			if (filters.accountStatus && !["ALL", ""].includes(filters.accountStatus)) {
				where = {
					...where,
					accountStatus: filters.accountStatus,
				};
			}

			where = {
				...where,
				role: "VENDOR",
			};
			// console.log("Final where clause:", JSON.stringify(where, null, 2));
			if (filters.searchText) {
				where = {
					...where,
					OR: [
						{ email: { contains: filters.searchText, mode: "insensitive" } },
						{ firstName: { contains: filters.searchText, mode: "insensitive" } },
						{ lastName: { contains: filters.searchText, mode: "insensitive" } },
					],
				};
			}

			try {
				const users = await ctx.prisma?.users.findMany({
					where: where,
					include: {
						vendor: true,
						events: {
							select: {
								bookings: true,
							},
						},
					},
					skip,
					take: limit,
					orderBy: [
						{ events: { _count: "desc" } },
						{ bookings: { _count: "desc" } }, // Push users with 0 bookings to the bottom
					],
				});

				// console.log(JSON.stringify(users));
				// users.sort((a, b) => (b.bookings.length || 0) - (a.bookings.length || 0));

				const response = {
					users: users.map((user) => {
						// Combine all bookings from all events
						const allBookings = user.events.flatMap((event) => event.bookings || []);
						const finalBookings = allBookings.filter((booking) => booking.status === "SUCCESS");
						// Calculate total tickets and revenue

						const totalTickets = calculateTotalTickets(finalBookings as unknown as IBooking[]);

						const totalRevenue = finalBookings.reduce((sum, booking) => {
							return sum + (Number(booking.totalAmount) || 0);
						}, 0);

						return {
							id: user.id,
							acountStatus: user.accountStatus,
							name: user?.firstName ? `${user?.firstName} ${user?.lastName ?? ""}` : "",
							avatarUrl: user?.avatarUrl,
							email: user?.email,
							totalTickets,
							totalRevenue,
							totalListing: user?.events?.length,
						};
					}), // Sum total tickets
				};

				// console.log(response);

				return response;
			} catch (error) {
				console.error("Error in getEvents:", error);
				throw error;
			}
		}),
	getBookedTicketDetails: adminProcedure
		.input(
			z.object({
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
				vendorId: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { timeFilter } = input;
			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);
			let where = {
				...dateFilter,
			};
			if (input.vendorId) {
				where = {
					...where,
					event: {
						vendorId: input.vendorId,
					},
				};
			}

			try {
				const totalListedEvents = await ctx.prisma?.events.count({
					where: {
						...where,
						status: "PUBLISHED",
					},
				});

				const totalPendingEvents = await ctx.prisma?.events.count({
					where: {
						...where,
						status: "PENDING",
					},
				});

				const bookings = await ctx.prisma?.bookings.findMany({
					where: {
						...where,
						status: "SUCCESS",
					},
					include: {
						event: true, // Fetch all event-related data
						user: true, // Fetch all event-related data
					},
				});

				const response = {
					totalListedEvents,
					totalPendingEvents,
					totalTicket: calculateTotalTickets(bookings as unknown as IBooking[]),
					totalRevenue: bookings.reduce((sum, booking) => sum + (booking.totalAmountWithTax || 0), 0), // Sum total revenue
					totalAmount: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0), // Sum total revenue
					bookingDetails: bookings.map((booking) => ({
						email: booking?.user.email, // Name of the user who booked
						eventName: booking.event.title, // Event name
						dateOfBooking: booking.createdAt, // Booking date
						numberOfTickets: Array.isArray(booking?.tickets)
							? booking.tickets.reduce((totalTick, tick) => {
									return Number(totalTick) + (Number((tick as any).quantity) || 0);
								}, 0)
							: 0, // Number of tickets
						totalPrice: booking.totalAmount, // Total price of booking
					})),
				};

				return response;
			} catch (error) {
				console.error("Error in getBookedTicketDetailsForVendor:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error getting booking details for vendor",
					cause: error,
				});
			}
		}),
	getVendorEvents: adminProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				sortBy: z.string().default("createdAt"),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
				vendorId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC", timeFilter } = input;

			const skip = (page - 1) * limit;

			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);

			let where: any = {
				...dateFilter,
				vendorId: input.vendorId,
			};

			try {
				const events = await ctx.prisma?.events.findMany({
					where: {
						...where,
					},
					skip,
					take: limit,
					orderBy: { [sortBy]: sortOrder.toLowerCase() },
					include: {
						bookingChart: true,
						bookingDetails: true,
						bookings: {
							select: {
								user: true,
								createdAt: true,
								tickets: true,
								totalAmount: true,
								members: true,
							},
						},
						users: {
							select: {
								id: true,
								username: true,
								mobileNumber: true,
								firstName: true,
								lastName: true,
								email: true,
								avatarUrl: true,
								accountStatus: true,
								vendor: true,
							},
						},
						reviews: {
							select: {
								rating: true,
								comment: true,
								createdAt: true,
							},
						},
					},
				});
				const user = await ctx.prisma.users.findUnique({
					where: {
						id: input.vendorId,
					},
					include: {
						vendor: true,
					},
				});

				// Calculate average rating for each event
				const eventsWithRating = events?.map((event) => ({
					...event,
					averageRating: event.reviews.length
						? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length
						: null,
				}));

				const totalTicket = events.reduce((sum, event) => {
					if (!event.bookings) return sum;
					return (
						sum +
						event.bookings.reduce((bookingSum, booking) => {
							if (!booking?.tickets) return bookingSum;
							return (
								bookingSum +
								(booking.tickets as [])?.reduce((ticketSum, ticket) => {
									return ticketSum + ((ticket as any)?.quantity || 0);
								}, 0)
							);
						}, 0)
					);
				}, 0);

				const totalRevenue = events.reduce((sum, event) => {
					if (!event.bookings) return sum;
					return (
						sum +
						event.bookings.reduce((bookingSum, booking) => {
							return bookingSum + (booking.totalAmount || 0);
						}, 0)
					);
				}, 0);

				const bookingDetails = events.flatMap(
					(event) =>
						event.bookings?.map((booking) => ({
							email: booking.user?.email || "",
							eventName: event.title || "",
							dateOfBooking: booking.createdAt,
							members: booking.members,
							numberOfTickets:
								(booking.tickets as any)?.reduce(
									(sum: number, ticket: any) => sum + Number(ticket.quantity || 0),
									0,
								) || 0,
							totalPrice: booking.totalAmount || 0,
						})) || [],
				);

				const response = {
					vendorDetails: user,
					events: eventsWithRating,
					totalTicket,
					totalRevenue,
					bookingDetails,
					pagination: {
						total: events.length,
						pages: Math.ceil(events.length / limit),
						page,
						limit,
					},
				};

				return response;
			} catch (error) {
				console.error("Error in getEventById:", error);
				throw error;
			}
		}),

	updateAccountStatus: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
				accountStatus: z.enum(["UNVERIFIED", "VERIFIED", "SUSPENDED"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.users.update({
					where: { id: input.userId },
					data: {
						accountStatus: input.accountStatus,
					},
				});

				await ctx.prisma.notifications.create({
					data: {
						userId: input.userId,
						message: "Your account has been updated to " + input.accountStatus,
					},
				});

				return {
					success: true,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error publishing event",
					cause: error,
				});
			}
		}),
	publish: adminProcedure
		.input(
			z.object({
				eventId: z.string(),
				status: z.enum(["UNPUBLISHED", "PUBLISHED", "PENDING"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const event = await ctx.prisma.events.findUnique({
					where: { id: input.eventId },
				});

				if (event?.status === input.status) {
					throw new TRPCError({ code: "BAD_REQUEST", message: "Event is already " + input.status });
				}

				const updatedEvent = await ctx.prisma.events.update({
					where: { id: input.eventId },
					include: {
						users: true,
					},
					data: {
						status: input.status,
						updatedAt: new Date(),
					},
				});

				// console.log("updatedEvent", updatedEvent?.users?.mobileNumber);
				if (updatedEvent?.users?.mobileNumber) {
					const message = `Hello Vendor! Your event "${updatedEvent.title}" has been published successfully. Event date: ${updatedEvent.startDate} to ${updatedEvent.endDate}. Thank you for using our platform.`;

					await sendWhatsAppMessage({
						to: updatedEvent?.users?.mobileNumber,
						message,
					});
				}

				await ctx.prisma.notifications.create({
					data: {
						userId: updatedEvent?.users?.id!,
						message:
							updatedEvent.status === "PUBLISHED"
								? `Your event "${updatedEvent?.title}" is live now 🎊. Please check it out.`
								: `Your event "${updatedEvent?.title}" has been downgraded to ${input.status.toLowerCase()} 🔴.`,
						link: "/event/detail/" + updatedEvent?.id,
					},
				});

				return {
					success: true,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error publishing event",
					cause: error,
				});
			}
		}),
	makeFeatured: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.featured.create({
					data: {
						eventId: input.eventId,
						featuredBy: ctx.session?.user?.id,
					},
				});

				return {
					success: true,
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error making event featured",
					cause: error,
				});
			}
		}),

	removeFeatured: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.featured.delete({
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
					message: "Error removing event from featured",
					cause: error,
				});
			}
		}),
});
