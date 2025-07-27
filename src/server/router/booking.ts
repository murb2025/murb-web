import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { calculateTotalTickets, getDateFilter } from "../helper/route.helper";
import Razorpay from "razorpay";
import { PaymentStatus } from "@prisma/client";
import {
	CONVENIENCE_FEE_PERCENTAGE,
	SGST_PERCENTAGE,
	CGST_PERCENTAGE,
	calculateAmountWithTax,
	VENDOR_CONVENIENCE_FEE_PERCENTAGE,
} from "@/constants/event.constant";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_SECRET_KEY,
});

export const bookingRouter = router({
	updatePaymentRollout: protectedProcedure
		.input(
			z.object({
				rolloutId: z.string(),
				paymentDate: z.date(),
				paymentMode: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CHEQUE"]),
				amount: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx?.session?.user.id;
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User not authorized",
					});
				}

				const paymentRollout = await ctx.prisma.payment_rollouts.update({
					where: { id: input.rolloutId },
					data: {
						paymentDate: input.paymentDate,
						paymentMode: input.paymentMode,
						amount: input.amount,
					},
				});

				return paymentRollout;
			} catch (error) {
				console.error("Error in updatePaymentRollout:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating payment rollout",
					cause: error,
				});
			}
		}),
	createPaymentRollout: protectedProcedure
		.input(
			z.object({
				bookingId: z.string(),
				paymentDate: z.date(),
				paymentMode: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CHEQUE"]),
				amount: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx?.session?.user.id;
				if (!userId) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "User not authorized",
					});
				}

				const paymentRollout = await ctx.prisma.payment_rollouts.upsert({
					where: {
						bookingId: input.bookingId,
					},
					create: {
						bookingId: input.bookingId,
						paymentDate: input.paymentDate,
						paymentMode: input.paymentMode,
						amount: input.amount,
						doneById: userId,
					},
					update: {
						paymentDate: input.paymentDate,
						paymentMode: input.paymentMode,
						amount: input.amount,
					},
				});

				return paymentRollout;
			} catch (error) {
				console.error("Error in createPaymentRollout:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error creating payment rollout",
					cause: error,
				});
			}
		}),
	createOrder: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				members: z.array(
					z.object({
						name: z.string(),
						phone: z.string(),
						email: z.string().optional(),
					}),
				),
				tickets: z.array(
					z.object({
						ticketId: z.string(),
						quantity: z.number(),
					}),
				),
				bookingChartId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { eventId, members, tickets } = input;

			try {
				const userId = ctx?.session?.user.id;

				if (!userId) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found.",
					});
				}
				// Validate event
				const event = await ctx.prisma.events.findUnique({
					where: { id: eventId },
				});

				if (!event) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Event not found.",
					});
				}

				if (!event?.maximumParticipants && !event?.isMonthlySubscription) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "No maximum participants.",
					});
				}

				const bookingChart = await ctx.prisma.bookingChart.findUnique({
					where: {
						id: input.bookingChartId,
						eventId: eventId,
					},
				});

				if (!bookingChart) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking chart not found.",
					});
				}

				if (!bookingChart.isBookingEnabled) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Booking is not enabled for this slot.",
					});
				}

				// calculate ticket count and amount
				let totalTicketCnt = 0;
				let totalAmount = 0;
				const bookingDetailTypeIds = tickets.map((ticket) => ticket.ticketId);
				const getBookingDetailType = await ctx.prisma.booking_details_types.findMany({
					where: {
						id: {
							in: bookingDetailTypeIds,
						},
					},
				});

				for (let tick of tickets) {
					totalTicketCnt += tick.quantity;
					totalAmount +=
						Number(getBookingDetailType.find((detail) => detail.id === tick.ticketId)?.amount) *
						tick.quantity;
				}

				if (totalTicketCnt <= 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Please select at least one ticket.",
					});
				}

				if (
					!event.isMonthlySubscription &&
					event?.maximumParticipants &&
					bookingChart?.bookedSeats + totalTicketCnt > event?.maximumParticipants
				) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message:
							"No seat available. Booking " +
							totalTicketCnt +
							" but only " +
							(event?.maximumParticipants - bookingChart?.bookedSeats) +
							" tickets left.",
					});
				}

				const { amountWithTax: AmountWithTax } = calculateAmountWithTax(totalAmount);
				console.log(AmountWithTax);
				const order = await razorpay.orders.create({
					amount: AmountWithTax * 100,
					currency: getBookingDetailType[0].currency,
				});
				const realMember = [];
				for (let i = 0; i < totalTicketCnt; i++) {
					realMember.push(members[i]);
				}
				const booking = await ctx.prisma.bookings.create({
					data: {
						isGroupBooking: totalTicketCnt > 1 ? true : false,
						totalAmount: totalAmount,
						totalAmountWithTax: AmountWithTax,
						currency: getBookingDetailType[0].currency,
						currencyIcon: getBookingDetailType[0].currencyIcon,
						members: realMember,
						tickets: tickets,
						status: PaymentStatus.PENDING,
						orderId: order.id,
						user: {
							connect: {
								id: userId,
							},
						},
						event: {
							connect: {
								id: eventId,
							},
						},
						bookedSlot: {
							connect: {
								id: bookingChart.id,
							},
						},
					},
					include: {
						event: true,
					},
				});

				return {
					success: true,
					orderId: order.id,
					bookingId: booking.id,
					totalAmount: totalAmount,
					currency: getBookingDetailType[0].currency,
					totalAmountWithTax: AmountWithTax,
				};
			} catch (error) {
				console.error("Error in createOrder:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error booking event",
					cause: error,
				});
			}
		}),
	getBookedTicket: protectedProcedure
		.input(
			z.object({
				cursor: z.string().nullish(),
				limit: z.number().default(10),
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { cursor, limit, timeFilter } = input;
			const userId = ctx?.session?.user.id;
			// console.log(userId);

			try {
				// findMany() returns an array because a user can have multiple bookings
				const bookings = await ctx.prisma?.bookings.findMany({
					where: {
						userId: userId, // Match bookings for the logged-in user
					},
					orderBy: {
						createdAt: "desc",
					},
					take: limit,
					cursor: cursor
						? {
								id: cursor,
							}
						: undefined,
					select: {
						id: true,
						paymentId: true,
						totalAmount: true,
						status: true,
						createdAt: true,
						members: true,
						bookedSlot: {
							select: {
								slot: true,
								date: true,
								bookedSeats: true,
							},
						},
						event: {
							select: {
								id: true,
								title: true,
								images: true,
								tags: true,
								startDate: true,
								endDate: true,
								startingTime: true,
								endingTime: true,
								location: true,
								city: true,
								state: true,
								country: true,
								pincode: true,
								// Using findFirst() since a user can only give one review per event
								reviews: {
									where: {
										userId: userId,
									},
									take: 1, // Limit to 1 review since we only want the user's review
								},
							},
						},
					},
				});

				let nextCursor: typeof cursor | undefined = undefined;
				if (bookings.length > limit) {
					const nextItem = bookings.pop();
					nextCursor = nextItem!.id;
				}

				return {
					events: bookings.map((booking) => ({
						...booking.event,
						bookingId: booking.id,
						paymentId: booking.paymentId,
						bookedAt: booking.createdAt,
						totalAmount: booking.totalAmount,
						status: booking.status,
						tickets: booking?.members?.length,
						bookedSlot: booking?.bookedSlot,
						reviews: booking?.event?.reviews,
					})),
					nextCursor,
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
	getBookedTicketDetailsForVendor: protectedProcedure
		.input(
			z.object({
				timeFilter: z.enum(["today", "this_week", "this_month", "all_time"]).default("all_time"),
				limit: z.number().default(10),
				page: z.number().default(1),
				status: z
					.enum([PaymentStatus.SUCCESS, PaymentStatus.PENDING, PaymentStatus.FAILED, "ALL"])
					.default(PaymentStatus.SUCCESS),
				eventId: z.string().optional(),
				searchText: z.string().optional(),
				vendorId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { timeFilter, limit, page, eventId, searchText, vendorId } = input;
			// console.log(vendorId);
			// Calculate date ranges based on timeFilter
			const dateFilter = getDateFilter(timeFilter);

			try {
				const totalListedEvents = await ctx.prisma?.events.count({
					where: {
						...dateFilter,
						vendorId: vendorId,
					},
				});
				const vendor = await ctx.prisma?.vendor.findUnique({
					where: {
						userId: vendorId,
					},
				});
				const bookings = await ctx.prisma?.bookings.findMany({
					where: {
						...dateFilter,
						status: input.status === "ALL" ? undefined : input.status,
						event: {
							vendorId: vendorId,
							...(eventId ? { id: eventId } : {}),
						},
						user: searchText
							? {
									OR: [
										{
											firstName: {
												contains: searchText,
												mode: "insensitive",
											},
										},
										{
											lastName: {
												contains: searchText,
												mode: "insensitive",
											},
										},
										{
											email: {
												contains: searchText,
												mode: "insensitive",
											},
										},
									],
								}
							: undefined,
					},
					take: limit,
					skip: (page - 1) * limit,
					include: {
						event: true, // Fetch all event-related data
						user: true, // Fetch all event-related data
					},
					orderBy: {
						createdAt: "desc",
					},
				});

				const response = {
					totalListedEvents: totalListedEvents,
					totalTicket: bookings.reduce((sum, booking) => {
						if (Array.isArray(booking?.tickets)) {
							const ticketSum = booking.tickets.reduce((totalTick, tick) => {
								return Number(totalTick) + (Number((tick as any).quantity) || 0);
							}, 0);
							return sum + Number(ticketSum);
						}
						return sum;
					}, 0), // Sum total tickets
					// totalRating: bookings.reduce((sum, booking) => sum + booking.event.reviews[0].rating, 0), // Sum total revenue
					totalRevenue: bookings.reduce(
						(sum, booking) => sum + booking.totalAmount * (1 - (vendor?.percentageCut || 0) / 100),
						0,
					), // Sum total revenue
					bookingDetails: bookings.map((booking) => ({
						email: booking?.user.email, // Name of the user who booked
						name: booking?.user.firstName
							? booking?.user.firstName + " " + (booking?.user.lastName ?? "")
							: "",
						avatarUrl: booking?.user.avatarUrl,
						eventName: booking.event.title, // Event name
						dateOfBooking: booking.createdAt, // Booking date
						numberOfTickets: Array.isArray(booking?.tickets)
							? booking.tickets.reduce((totalTick, tick) => {
									return Number(totalTick) + (Number((tick as any).quantity) || 0);
								}, 0)
							: 0, // Number of tickets
						totalPrice: booking.totalAmount, // Total price of booking
						status: booking.status,
						members: booking.members,
					})),
					totalPages: Math.ceil(bookings.length / limit),
				};
				// console.log(response);
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
	getBookingById: protectedProcedure.input(z.object({ bookingId: z.string() })).query(async ({ ctx, input }) => {
		const { bookingId } = input;
		const booking = await ctx.prisma.bookings.findUnique({
			where: { id: bookingId },
			include: {
				event: {
					include: {
						users: true,
						reviews: {
							where: {
								userId: ctx?.session?.user.id!,
							},
						},
					},
				},
				bookedSlot: true,
			},
		});
		return booking;
	}),

	getRevenue: protectedProcedure
		.input(
			z.object({
				year: z.number().default(new Date().getFullYear()),
				isUserSpecific: z.boolean().default(false),
				eventId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { year } = input;
			try {
				const userId = ctx?.session?.user.id;
				let whereClause: any = {};
				if (input.isUserSpecific) {
					whereClause.event = {
						vendorId: userId,
					};
				}

				if (input.eventId) {
					whereClause.event = {
						...whereClause.event,
						id: input.eventId,
					};
				}

				const bookings = await ctx.prisma.bookings.findMany({
					include: {
						event: {
							include: {
								users: {
									include: {
										vendor: true,
									},
								},
							},
						},
					},
					where: {
						...whereClause,
						createdAt: {
							gte: new Date(`${year}-01-01`), // Start of the year
							lt: new Date(`${year + 1}-01-01`), // Start of next year
						},
					},
				});

				// Calculate the actual revenue with the percentage cut
				const revenueByDate = bookings.reduce((acc: any, booking) => {
					const date = booking.createdAt.toISOString().split("T")[0]; // Get YYYY-MM-DD format
					const percentageCut = (booking?.event.users?.vendor?.percentageCut || 0) / 100;
					const actualRevenue = booking.totalAmount * percentageCut;

					if (!acc[date]) {
						acc[date] = 0;
					}

					acc[date] += actualRevenue;
					return acc;
				}, {});

				// If you need the format to match your original groupBy structure
				const formattedResult = Object.entries(revenueByDate).map(([date, revenue]) => ({
					createdAt: new Date(date),
					_sum: {
						totalAmount: revenue,
					},
				}));
				// Process results into the required format
				const monthNames = [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December",
				];

				// Initialize an array with zero values for each month
				const monthlyRevenue = Array(12).fill(0);

				formattedResult.forEach(({ createdAt, _sum }) => {
					const month = new Date(createdAt).getMonth(); // Get month index (0-11)
					monthlyRevenue[month] += _sum.totalAmount || 0;
				});

				const chartData = monthNames.map((month, index) => ({
					month,
					revenue: monthlyRevenue[index], // Prisma's groupBy does not return missing months, so we ensure all months are included
				}));

				return chartData;
			} catch (error) {
				console.error("Error in getRevenue:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error getting revenue",
					cause: error,
				});
			}
		}),
	getTotalRevenue: protectedProcedure
		.input(
			z.object({
				year: z.number().default(new Date().getFullYear()),
				isUserSpecific: z.boolean().default(false),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { year } = input;
			const userId = ctx?.session?.user.id;
			let whereClause = {};
			if (input.isUserSpecific) {
				whereClause = {
					event: {
						vendorId: userId,
					},
				};
			}

			const bookings = await ctx.prisma.bookings.groupBy({
				by: ["createdAt"],
				_sum: {
					totalAmount: true,
				},
				where: {
					...whereClause,
					createdAt: {
						gte: new Date(`${year}-01-01`), // Start of the year
						lt: new Date(`${year + 1}-01-01`), // Start of next year
					},
				},
			});
			// Process results into the required format
			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];

			// Initialize an array with zero values for each month
			const monthlyRevenue = Array(12).fill(0);

			bookings.forEach(({ createdAt, _sum }) => {
				const month = new Date(createdAt).getMonth(); // Get month index (0-11)
				monthlyRevenue[month] += _sum.totalAmount || 0;
			});

			const chartData = monthNames.map((month, index) => ({
				month,
				revenue: monthlyRevenue[index], // Prisma's groupBy does not return missing months, so we ensure all months are included
			}));

			return chartData;
		}),

	getPaymentDetails: protectedProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				searchText: z.string().optional(),
				dateRange: z
					.object({
						startDate: z.date().optional(),
						endDate: z.date().optional(),
					})
					.optional(),
				amountRange: z
					.object({
						min: z.number().optional(),
						max: z.number().optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page, limit, searchText, dateRange, amountRange } = input;

			try {
				// Build where conditions based on filters
				let whereConditions: any = {
					status: "SUCCESS",
				};

				if (searchText) {
					whereConditions = {
						...whereConditions,
						OR: [
							{
								event: {
									title: {
										contains: searchText,
										mode: "insensitive",
									},
									users: {
										firstName: {
											contains: searchText,
											mode: "insensitive",
										},
										lastName: {
											contains: searchText,
											mode: "insensitive",
										},
									},
								},
							},
							{
								user: {
									firstName: {
										contains: searchText,
										mode: "insensitive",
									},
								},
							},
							{
								user: {
									lastName: {
										contains: searchText,
										mode: "insensitive",
									},
								},
							},
							{
								paymentId: {
									contains: searchText,
									mode: "insensitive",
								},
							},
							{
								user: {
									email: {
										contains: searchText,
										mode: "insensitive",
									},
								},
							},
						],
					};
				}

				// Filter by date range
				if (dateRange) {
					whereConditions.createdAt = {};

					if (dateRange.startDate) {
						whereConditions.createdAt.gte = dateRange.startDate;
					}

					if (dateRange.endDate) {
						whereConditions.createdAt.lte = dateRange.endDate;
					}
				}

				// Filter by amount range
				if (amountRange) {
					whereConditions.totalAmount = {};

					if (amountRange.min !== undefined) {
						whereConditions.totalAmount.gte = amountRange.min;
					}

					if (amountRange.max !== undefined) {
						whereConditions.totalAmount.lte = amountRange.max;
					}
				}

				const paymentDetails = await ctx.prisma.bookings.findMany({
					where: whereConditions,
					take: limit,
					skip: (page - 1) * limit,
					include: {
						event: {
							include: {
								users: {
									include: {
										vendor: true,
									},
								},
							},
						},
						user: true,
						paymentRollout: {
							include: {
								doneBy: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				
				const totalCount = await ctx.prisma.bookings.count({
					where: whereConditions,
				});

				return {
					paymentDetails: paymentDetails.map((payment) => ({
						vendorId: payment.event.users?.id,
						eventName: payment.event.title,
						vendorName: payment.event.users?.firstName
							? payment.event.users?.firstName + " " + (payment.event.users?.lastName ?? "")
							: "",
						gstNumber: payment.event.users?.vendor?.gstNumber,
						avatarUrl: payment.event.users?.avatarUrl,
						email: payment.event.users?.email,
						totalPrice: payment.totalAmount,
						amountWithTax: payment.totalAmountWithTax,
						percentageCut: payment.event.users?.vendor?.percentageCut,
						paybleAmount: payment.totalAmount * (Number(payment.event.users?.vendor?.percentageCut) / 100),
						netPaybleAmount:
							payment.totalAmount *
							(Number(payment.event.users?.vendor?.percentageCut) / 100) *
							(VENDOR_CONVENIENCE_FEE_PERCENTAGE / 100),
						revenue: payment.totalAmount * (1 - Number(payment.event.users?.vendor?.percentageCut) / 100),
						dateOfBooking: payment.createdAt,
						paymentId: payment.paymentId,
						payeeName: payment.user?.firstName
							? payment.user?.firstName + " " + (payment.user?.lastName ?? "")
							: "",
						payeeEmail: payment.user?.email,
						payeeAvatarUrl: payment.user?.avatarUrl,
						id: payment.id,
						paymentRollout: payment.paymentRollout
							? {
									paymentDate: payment.paymentRollout.paymentDate,
									paymentMode: payment.paymentRollout.paymentMode,
									amount: payment.paymentRollout.amount,
									doneBy: {
										name: payment.paymentRollout.doneBy.firstName
											? payment.paymentRollout.doneBy.firstName +
												" " +
												(payment.paymentRollout.doneBy.lastName ?? "")
											: "",
										email: payment.paymentRollout.doneBy.email,
									},
									id: payment.paymentRollout.id,
								}
							: null,
					})),
					pagination: {
						totalPages: Math.ceil(totalCount / limit),
						currentPage: page,
						totalItems: totalCount,
					},
				};
			} catch (error) {
				console.error("Error in getPaymentDetails:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error getting payment details",
					cause: error,
				});
			}
		}),
	getPaymentDetailsForXlsx: protectedProcedure
		.input(
			z.object({
				page: z.number().default(1),
				limit: z.number().default(10),
				searchText: z.string().optional(),
				dateRange: z
					.object({
						startDate: z.date().optional(),
						endDate: z.date().optional(),
					})
					.optional(),
				amountRange: z
					.object({
						min: z.number().optional(),
						max: z.number().optional(),
					})
					.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { page, limit, searchText, dateRange, amountRange } = input;

			try {
				// Build where conditions based on filters
				let whereConditions: any = {
					status: "SUCCESS",
				};

				if (searchText) {
					whereConditions = {
						...whereConditions,
						OR: [
							{
								event: {
									title: {
										contains: searchText,
										mode: "insensitive",
									},
								},
							},
							{
								user: {
									firstName: {
										contains: searchText,
										mode: "insensitive",
									},
								},
							},
							{
								user: {
									lastName: {
										contains: searchText,
										mode: "insensitive",
									},
								},
							},
						],
					};
				}

				// Filter by date range
				if (dateRange) {
					whereConditions.createdAt = {};

					if (dateRange.startDate) {
						whereConditions.createdAt.gte = dateRange.startDate;
					}

					if (dateRange.endDate) {
						whereConditions.createdAt.lte = dateRange.endDate;
					}
				}

				// Filter by amount range
				if (amountRange) {
					whereConditions.totalAmount = {};

					if (amountRange.min !== undefined) {
						whereConditions.totalAmount.gte = amountRange.min;
					}

					if (amountRange.max !== undefined) {
						whereConditions.totalAmount.lte = amountRange.max;
					}
				}

				const paymentDetails = await ctx.prisma.bookings.findMany({
					where: whereConditions,
					take: limit,
					skip: (page - 1) * limit,
					include: {
						event: {
							include: {
								users: {
									include: {
										vendor: true,
									},
								},
							},
						},
						user: true,
						paymentRollout: {
							include: {
								doneBy: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});

				const totalCount = await ctx.prisma.bookings.count({
					where: whereConditions,
				});

				return {
					paymentDetails,
					pagination: {
						totalPages: Math.ceil(totalCount / limit),
						currentPage: page,
						totalItems: totalCount,
					},
				};
			} catch (error) {
				console.error("Error in getPaymentDetails:", error);
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error getting payment details",
					cause: error,
				});
			}
		}),
});
