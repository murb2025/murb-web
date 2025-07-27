import { protectedProcedure, publicProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma, Visibility } from "@prisma/client";
import { getDateFilter, getDateFilterByStartDateEndDate, isAdminEmailServer } from "@/server/helper/route.helper";
import { createEventSchema, updateEventSchema } from "../helper/event.schema";

export const eventRouter = router({
	createReview: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				rating: z.number().min(1).max(5),
				comment: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to submit a review",
				});
			}

			try {
				const review = await ctx.prisma.reviews.create({
					data: {
						eventId: input.eventId,
						userId: ctx.session.user.id,
						rating: input.rating,
						comment: input.comment,
						visible: true,
					},
				});

				return review;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create review",
					cause: error,
				});
			}
		}),
	search: publicProcedure
		.input(
			z.object({
				query: z.string(),
				limit: z.number().min(1).max(100).default(10),
				cursor: z.string().nullish(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { query, limit, cursor } = input;

			try {
				const events = await ctx.prisma.events.findMany({
					where: {
						AND: [
							{
								status: "PUBLISHED",
							},
							{
								OR: [
									{
										title: {
											contains: input.query,
											mode: "insensitive",
										},
									},
									{
										description: {
											contains: input.query,
											mode: "insensitive",
										},
									},
									{
										tags: {
											contains: input.query,
											mode: "insensitive",
										},
									},
								],
							},
						],
					},
					include: {
						bookingDetails: true,
						users: true,
						bookingChart: true,
					},
					take: input.limit + 1,
					cursor: input.cursor ? { id: input.cursor } : undefined,
				});

				let nextCursor: typeof cursor | undefined = undefined;
				if (events.length > limit) {
					const nextItem = events.pop();
					nextCursor = nextItem!.id;
				}

				return {
					events,
					nextCursor,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to search events",
					cause: error,
				});
			}
		}),
	createEvent: publicProcedure.input(createEventSchema).mutation(async ({ ctx, input }) => {
		// console.log(input);

		try {
			const {
				bookingDetails,
				images,
				vendorId,
				slotDuration,
				sportType,
				startDate,
				endDate,
				startingTime,
				endingTime,
				visibility,
				termsAndConditions,
				...eventData
			} = input;

			let sanitizedWeekDays;
			if (input.weekDays) {
				sanitizedWeekDays = input?.weekDays.filter((day) => day.trim() !== "");
			}
			const result = await ctx.prisma.events.create({
				data: {
					...eventData,
					pincode: eventData.pincode || "",
					sportType: sportType || "",
					slotDuration: slotDuration || 0,
					images: images,
					tags: input?.tags || "",

					weekDays: sanitizedWeekDays,
					isMonthlySubscription: input?.isMonthlySubscription || false,
					startDate,
					endDate,
					teamSize: input?.teamSize || 0,
					bookingChart:
						input.bookingChart && input.bookingChart?.length > 0
							? {
									create: input.bookingChart.map((chart) => ({
										date: chart.date,
										slot: chart.slot,
										bookedSeats: chart.bookedSeats,
									})),
								}
							: undefined,
					startingTime,
					endingTime,
					termsAndConditions,
					visibility: visibility.toUpperCase() as Visibility,
					status: "PENDING",
					...(vendorId && {
						users: {
							connect: { id: vendorId },
						},
					}),
					...(bookingDetails?.length && {
						bookingDetails: {
							create: bookingDetails.map((detail) => ({
								type: detail.type,
								membersCount: detail.membersCount || 0,
								title: detail.title || null,
								amount: detail.amount,
								months: detail.months || null,
								currency: detail.currency || "INR",
								currencyIcon: detail.currencyIcon || "₹",
								description: detail.description || "",
							})),
						},
					}),
				},
				include: {
					bookingDetails: true,
					users: true,
				},
			});

			return {
				statusCode: 200,
				message: "Event created successfully",
				data: result,
			};
		} catch (error) {
			console.log("Failed to create event", error);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to create event",
				cause: error,
			});
		}
	}),
	updateEvent: protectedProcedure.input(updateEventSchema).mutation(async ({ ctx, input }) => {
		const { eventId, data } = input;

		try {
			// First, fetch existing event to get related records
			const existingEvent = await ctx.prisma.events.findUnique({
				where: { id: eventId },
				include: {
					bookingChart: true,
					bookingDetails: true,
				},
			});

			if (!existingEvent) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Event not found",
				});
			}

			if (existingEvent.vendorId !== ctx.session?.user?.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not authorized to update this event",
				});
			}

			// Prepare the basic event update data
			const eventUpdateData = {
				vendorId: data?.vendorId || undefined,
				sportType: data?.sportType || "",
				// General info
				title: data?.title,
				host: data?.host,
				description: data?.description,

				isOnline: data?.isOnline,
				isHomeService: data?.isHomeService,
				landmark: data?.landmark,
				location: data?.location,
				city: data?.city,
				state: data?.state,
				country: data?.country,
				pincode: data?.pincode,

				eventType: data?.eventType,
				amenities: data?.amenities,

				// Schedule info
				multipleDays: data?.multipleDays,
				isMonthlySubscription: data?.isMonthlySubscription,
				startDate: data?.startDate,
				endDate: data?.endDate,
				weekDays: data?.weekDays,

				startingTime: data?.startingTime,
				endingTime: data?.endingTime,

				isHaveSlots: data?.isHaveSlots,
				slotDuration: data?.slotDuration,
				slots: data?.slots,

				isTeamEvent: data?.isTeamEvent,
				teamSize: data?.teamSize,
				maximumParticipants: data?.maximumParticipants,

				images: data?.images,
				termsAndConditions: data?.termsAndConditions,

				// admin info
				language: data?.language,
				visibility: data?.visibility ? (data.visibility.toUpperCase() as Visibility) : undefined,
				status: existingEvent?.status,
			};

			// Update the event with main data
			const updatedEvent = await ctx.prisma.events.update({
				where: { id: eventId },
				data: eventUpdateData,
			});

			// Update booking charts if provided
			if (data?.bookingChart?.length > 0) {
				// For each booking chart in the input data
				for (const chart of data.bookingChart) {
					if (chart.id) {
						// If it has an ID, it might exist - try to update
						const existingChart = existingEvent.bookingChart.find((ec) => ec.id === chart.id);

						if (existingChart) {
							// Update existing record
							await ctx.prisma.bookingChart.update({
								where: { id: chart.id },
								data: {
									date: chart.date,
									slot: chart.slot,
									bookedSeats: chart.bookedSeats,
								},
							});
						} else {
							// Create new with specified ID
							await ctx.prisma.bookingChart.create({
								data: {
									id: chart.id,
									eventId: eventId,
									date: chart.date,
									slot: chart.slot,
									bookedSeats: chart.bookedSeats,
								},
							});
						}
					} else {
						// No ID provided, create new
						await ctx.prisma.bookingChart.create({
							data: {
								eventId: eventId,
								date: chart.date,
								slot: chart.slot,
								bookedSeats: chart.bookedSeats,
							},
						});
					}
				}

				// Handle deletion of records not included in the update
				const updatedChartIds = data.bookingChart.filter((chart) => chart.id).map((chart) => chart.id);

				const chartsToDelete = existingEvent.bookingChart.filter(
					(chart) => !updatedChartIds.includes(chart.id),
				);

				for (const chart of chartsToDelete) {
					await ctx.prisma.bookingChart.delete({
						where: { id: chart.id },
					});
				}
			}

			// Update booking details if provided
			if (data?.bookingDetails?.length > 0) {
				// For each booking detail in the input data
				for (const detail of data.bookingDetails) {
					if (detail.id) {
						// If it has an ID, it might exist - try to update
						const existingDetail = existingEvent.bookingDetails.find((ed) => ed.id === detail.id);

						if (existingDetail) {
							// Update existing record
							await ctx.prisma.booking_details_types.update({
								where: { id: detail.id },
								data: {
									type: detail.type,
									membersCount: detail.membersCount || 0,
									title: detail.title || null,
									amount: detail.amount,
									months: detail.months || null,
									currency: detail.currency || "INR",
									currencyIcon: detail.currencyIcon || "₹",
									description: detail.description || "",
								},
							});
						} else {
							// Create new with specified ID
							await ctx.prisma.booking_details_types.create({
								data: {
									id: detail.id,
									eventId: eventId,
									type: detail.type,
									membersCount: detail.membersCount || 0,
									title: detail.title || null,
									months: detail.months || null,
									amount: detail.amount,
									currency: detail.currency || "INR",
									currencyIcon: detail.currencyIcon || "₹",
									description: detail.description || "",
								},
							});
						}
					} else {
						// No ID provided, create new
						await ctx.prisma.booking_details_types.create({
							data: {
								eventId: eventId,
								type: detail.type,
								membersCount: detail.membersCount || 0,
								months: detail.months || null,
								title: detail.title || null,
								amount: detail.amount,
								currency: detail.currency || "INR",
								currencyIcon: detail.currencyIcon || "₹",
								description: detail.description || "",
							},
						});
					}
				}

				// Handle deletion of records not included in the update
				const updatedDetailIds = data.bookingDetails.filter((detail) => detail.id).map((detail) => detail.id);

				const detailsToDelete = existingEvent.bookingDetails.filter(
					(detail) => !updatedDetailIds.includes(detail.id),
				);

				for (const detail of detailsToDelete) {
					await ctx.prisma.booking_details_types.delete({
						where: { id: detail.id },
					});
				}
			}

			// Fetch the fully updated event with all relations
			const finalUpdatedEvent = await ctx.prisma.events.findUnique({
				where: { id: eventId },
				include: {
					bookingDetails: true,
					users: true,
					bookingChart: true,
				},
			});

			return {
				statusCode: 200,
				message: "Event updated successfully",
				data: { eventId: finalUpdatedEvent?.id },
			};
		} catch (error) {
			console.log("Failed to update event", error);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to update event",
				cause: error,
			});
		}
	}),

	deleteEvent: protectedProcedure.input(z.object({ eventId: z.string() })).mutation(async ({ ctx, input }) => {
		const { eventId } = input;

		try {
			const event = await ctx.prisma.events.findUnique({
				where: { id: eventId },
				include: {
					users: true,
				},
			});

			if (!event) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
			}

			if (!isAdminEmailServer(ctx.session?.user?.email || "")) {
				if (event.vendorId !== ctx.session?.user?.id) {
					throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to delete this event" });
				}
			}

			return await ctx.prisma.$transaction(async (tx) => {
				// Delete all related records first
				await tx.featured.deleteMany({ where: { eventId } });
				await tx.trending.deleteMany({ where: { eventId } });
				await tx.bookmark.deleteMany({ where: { eventId } });
				await tx.promotionPayment.deleteMany({ where: { eventId } });
				await tx.addonPayment.deleteMany({ where: { eventId } });

				// Delete reviews and their comments
				const reviews = await tx.reviews.findMany({ where: { eventId } });
				for (const review of reviews) {
					await tx.comments.deleteMany({ where: { reviewId: review.id } });
				}
				await tx.reviews.deleteMany({ where: { eventId } });

				// Delete bookings first
				await tx.bookings.deleteMany({ where: { eventId } });

				// Then delete booking charts
				await tx.bookingChart.deleteMany({ where: { eventId } });

				// Delete booking details types
				await tx.booking_details_types.deleteMany({ where: { eventId } });

				// Finally delete the event
				return await tx.events.delete({ where: { id: eventId } });
			});
		} catch (error: any) {
			console.log("Failed to delete event", error.message);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete event",
			});
		}
	}),

	getEvents: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				cursor: z.string().nullish(),
				isCurrUserSpecific: z.boolean().optional(),
				showTopRated: z.boolean().optional(),
				showTopBooked: z.boolean().optional(),
				sortBy: z.string().default("createdAt"),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				title: z.string().optional(),
				category: z.string().optional(),
				status: z.enum(["PENDING", "PUBLISHED", "UNPUBLISHED", "ALL"]).optional(),
				visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
				location: z.string().optional(),
				city: z.string().optional(),
				state: z.string().optional(),
				country: z.string().optional(),
				pincode: z.string().optional(),
				landmark: z.string().optional(),
				amenities: z.array(z.string()).optional(),
				isOnline: z.boolean().optional(),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
				eventSpecificType: z.string().optional(),
				sportType: z.string().optional(),
				tag: z.string().optional(),
				tagsArrayString: z.string().optional(),
				query: z.string().optional(),
				featured: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const {
				limit = 10,
				cursor,
				sortBy = "startDate",
				sortOrder = "DESC",
				timeFilter,
				showTopRated = false,
				showTopBooked = false,
				...filters
			} = input;

			const dateFilter = getDateFilterByStartDateEndDate(timeFilter);

			// Build base where clause
			let where: any = {
				...dateFilter,
				...(filters.category && { category: filters.category }),
				...(filters.status && filters.status !== "ALL" && { status: filters.status }),
				...(filters.visibility && { visibility: filters.visibility }),
				...(filters.isOnline !== undefined && { isOnline: filters.isOnline }),
			};

			// Add location filters if provided
			if (filters.location || filters.city || filters.state || filters.country || filters.pincode || filters.landmark) {
				where = {
					...where,
					AND: [
						...(filters.location ? [{ location: { equals: filters.location, mode: "insensitive" } }] : []),
						...(filters.city ? [{ city: { equals: filters.city, mode: "insensitive" } }] : []),
						...(filters.state ? [{ state: { equals: filters.state, mode: "insensitive" } }] : []),
						...(filters.country ? [{ country: { equals: filters.country, mode: "insensitive" } }] : []),
						...(filters.pincode ? [{ pincode: { equals: filters.pincode, mode: "insensitive" } }] : []),
						...(filters.landmark ? [{ landmark: { equals: filters.landmark, mode: "insensitive" } }] : []),
					].filter(condition => Object.keys(condition).length > 0),
				};
			}

			// Add user-specific filter
			if (filters.isCurrUserSpecific && ctx?.session?.user?.id) {
				where = {
					...where,
					users: {
						id: ctx.session.user.id,
					},
				};
			}

			// Add featured filter
			if (input.featured !== undefined) {
				where = {
					...where,
					featured: input.featured ? { isNot: null } : null,
				};
			}

			// Add event type and sport type filters
			if (filters.eventSpecificType && !["all", ""].includes(filters.eventSpecificType)) {
				where = {
					...where,
					eventSpecificType: {
						contains: filters.eventSpecificType,
						mode: "insensitive",
					},
				};
			}

			if (filters.sportType && !["all", "", "other", "Other"].includes(filters.sportType)) {
				where = {
					...where,
					sportType: {
						contains: filters.sportType,
						mode: "insensitive",
					},
				};
			}

			// Add tag filters
			if (filters.tagsArrayString) {
				const tagArray = filters.tagsArrayString
					?.split("|")
					.filter((tag) => tag.trim() !== "" && !["all", "", "Other"].includes(tag.trim()));
				if (tagArray.length > 0) {
					where = {
						...where,
						tags: {
							in: tagArray,
							mode: "insensitive",
						},
					};
				}
			}

			// Add title search
			if (filters.title) {
				const searchTerm = filters.title.toLowerCase();
				where = {
					...where,
					OR: [
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
					],
				};
			}

			// Add date filters for future events
			where = {
				...where,
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
			};

			try {
				// First, get only the event IDs with pagination
				const eventIds = await ctx.prisma.events.findMany({
					where,
					select: { id: true },
					take: limit + 1,
					cursor: cursor ? { id: cursor } : undefined,
					orderBy: { [sortBy]: sortOrder.toLowerCase() },
				});

				// Then, fetch the required data for these IDs
				const events = await ctx.prisma.events.findMany({
					where: {
						id: {
							in: eventIds.map(e => e.id)
						}
					},
					select: {
						id: true,
						title: true,
						sportType: true,
						tags: true,
						images: true,
						status: true,
						multipleDays: true,
						startDate: true,
						endDate: true,
						startingTime: true,
						endingTime: true,
						isOnline: true,
						location: true,
						city: true,
						state: true,
						country: true,
						pincode: true,
						landmark: true,
						maximumParticipants: true,
						slots : true,
						weekDays: true,
						isHomeService: true,
						eventSpecificType: true,
						_count: {
							select: {
								bookingChart: true,
							},
						},
						bookingDetails: {
							select: {
								id: true,
								type: true,
								amount: true,
								currency: true,
								currencyIcon: true,
							}
						},
						reviews: {
							select: {
								rating: true,
							}
						},
						addonPayment: {
							select: {
								id: true,
								status: true,
								createdAt: true,
								updatedAt: true,
							}
						},
					},
				});

				let nextCursor: typeof cursor | undefined = undefined;
				if (eventIds.length > limit) {
					const nextItem = eventIds.pop();
					nextCursor = nextItem!.id;
				}

				return {
					items: events,
					nextCursor,
				};
			} catch (error) {
				console.error("Error in getEvents:", error);
				throw error;
			}
		}),

	getTrendingEvents: publicProcedure
		.input(
			z.object({
				isCurrUserSpecific: z.boolean().optional(),
				page: z.number().default(1),
				limit: z.number().default(9),
				sortBy: z.string().default("createdAt"),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				title: z.string().optional(),
				category: z.string().optional(),
				status: z.enum(["PENDING", "PUBLISHED", "UNPUBLISHED", "ALL"]).optional(),
				visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page = 1, limit = 9, sortBy = "startDate", sortOrder = "DESC", ...filters } = input;
			const skip = (page - 1) * limit;

			let where: any = {
				...(filters.category && { category: filters.category }),
				...(filters.status && filters.status !== "ALL" && { status: filters.status }),
				...(filters.visibility && { visibility: filters.visibility }),
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
			};

			if (filters.isCurrUserSpecific && ctx?.session?.user?.id) {
				where = {
					...where,
					users: {
						id: ctx.session.user.id,
					},
				};
			}

			if (filters.title) {
				const searchTerm = filters.title.toLowerCase();
				where = {
					...where,
					OR: [
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
					],
				};
			}

			try {
				// First, get the total count
				const total = await ctx.prisma.events.count({ where });

				// Then, get the events with their booking counts
				const events = await ctx.prisma.events.findMany({
					where,
					skip,
					take: limit,
					orderBy: { [sortBy]: sortOrder.toLowerCase() },
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
						tags: true,
						maximumParticipants: true,
						slots : true,
						_count : {
							select : {
								bookingChart : true
							}
						},
						bookingDetails: {
							select: {
								id: true,
								type: true,
								amount: true,
								currency: true,
								currencyIcon: true,
							}
						},
						reviews: {
							select: {
								rating: true,
							}
						},
						bookings: {
							select: {
								id: true,
							}
						},
					},
				});

				// Calculate percentage sold for each event
				const eventsWithPercentage = events.map(event => {
					const totalBookings = event.bookings.length;
					const totalCapacity = event.maximumParticipants || 0;
					const percentageSold = totalCapacity > 0 ? (totalBookings * 100) / totalCapacity : 0;

					return {
						...event,
						percentageSold,
						bookings: undefined, // Remove bookings from response
					};
				});

				return {
					events: eventsWithPercentage,
					pagination: {
						total,
						pages: Math.ceil(total / limit),
						page,
						limit,
					},
				};
			} catch (error) {
				console.error("Error in getTrendingEvents:", error);
				throw error;
			}
		}),

	getEventById: publicProcedure
		.input(
			z.object({
				eventId: z.string().optional(),
				includeBookingChart : z.boolean().optional().default(true),
			}),
		)
		.query(async ({ ctx, input }) => {

			const { eventId, includeBookingChart } = input;

			try {
				const event = await ctx.prisma?.events.findUnique({
					where: {
						id: eventId,
					},
					include: {
						bookingDetails: true,
						bookingChart: includeBookingChart,
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
								updatedAt: true,
								users: {
									select: {
										firstName: true,
										lastName: true,
										avatarUrl: true,
									},
								},
								comments: {
									select: {
										content: true,
										createdAt: true,
										updatedAt: true,
										user: {
											select: {
												firstName: true,
												lastName: true,
												avatarUrl: true,
												role: true,
											},
										},
									},
								},
							},
						},
					},
				});

				return {
					event: event,
				};
			} catch (error) {
				console.error("Error in getEventById:", error);
				throw error;
			}
		}),
	getVendorEvents: protectedProcedure
		.input(
			z.object({
				cursor: z.string().nullish(),
				limit: z.number().default(10),
				title: z.string().optional(),
				sortBy: z.string().default("createdAt"),
				vendorId: z.string().optional(),
				sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
				status: z.enum(["PENDING", "PUBLISHED", "UNPUBLISHED", "ALL"]).optional(),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
			}),
		)
		.query(async ({ ctx, input }) => {
			// console.log("Search Input:", input);
			const { cursor, limit = 10, sortBy = "createdAt", sortOrder = "DESC", timeFilter } = input;

			const vendorId = input.vendorId ?? ctx.session?.user.id;

			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);

			let where: any = {
				...dateFilter,
				vendorId,
			};

			if (input.status && input.status !== "ALL") {
				where = {
					...where,
					status: input.status,
				};
			}

			// If title is provided, search in both title and tags
			if (input.title) {
				const searchTerm = input.title.toLowerCase();
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

			try {
				const events = await ctx.prisma?.events.findMany({
					where,
					cursor: cursor ? { id: cursor } : undefined,
					take: limit + 1,
					orderBy: { [sortBy]: sortOrder.toLowerCase() },
					include: {
						bookingDetails: true,
						bookingChart: true,
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
				console.error("Error in getVendorEvents:", error);
				throw error;
			}
		}),

	getPublishedEvents: protectedProcedure.query(async ({ ctx }) => {
		try {
			const events = await ctx.prisma.events.findMany({
				where: {
					vendorId: ctx.session?.user.id,
					status: "PUBLISHED",
				},
				select: {
					id: true,
					title: true,
				},
			});
			return events;
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error fetching published events",
				cause: error,
			});
		}
	}),

	toggleBookingEnabled: protectedProcedure
		.input(
			z.object({
				bookingChartId: z.string(),
				isEnabled: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				// Find all booking chart entries for this date
				const bookingCharts = await ctx.prisma.bookingChart.findUnique({
					where: {
						id: input.bookingChartId,
					},
				});

				if (!bookingCharts) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking chart not found",
					});
				}
				// Update all entries for this date
				await ctx.prisma.bookingChart.updateMany({
					where: {
						id: input.bookingChartId,
					},
					data: {
						isBookingEnabled: input.isEnabled,
					},
				});

				return bookingCharts;
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error toggling booking status",
					cause: error,
				});
			}
		}),

	getEvent: publicProcedure.input(z.string()).query(async ({ ctx, input: eventId }) => {
		try {
			const event = await ctx.prisma.events.findUnique({
				where: { id: eventId },
				include: {
					bookingDetails: true,
					promotionPayment: true,
					users: {
						select: {
							id: true,
							username: true,
							firstName: true,
							lastName: true,
							email: true,
							avatarUrl: true,
							accountStatus: true,
						},
					},
					reviews: {
						include: {
							users: {
								select: {
									id: true,
									username: true,
									firstName: true,
									lastName: true,
									avatarUrl: true,
								},
							},
						},
					},
				},
			});

			if (!event) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Event not found",
				});
			}

			// Calculate average rating
			const averageRating = event.reviews.length
				? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length
				: null;

			return {
				...event,
				averageRating,
			};
		} catch (error) {
			if (error instanceof TRPCError) throw error;
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Error fetching event",
				cause: error,
			});
		}
	}),
});
