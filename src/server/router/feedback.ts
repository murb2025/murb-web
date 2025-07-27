import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { prisma } from "@/server/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

// Define the feedback router with direct logic in procedures
export const feedbackRouter = router({
	getPublishedEvents: protectedProcedure
		.input(
			z.object({
				vendorSpecific: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const events = await ctx.prisma.events.findMany({
					where: {
						...(input.vendorSpecific ? { vendorId: ctx.session?.user?.id } : {}),
						status: "PUBLISHED",
					},
					select: {
						id: true,
						title: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				});

				return {
					statusCode: 200,
					message: "Events fetched successfully",
					data: events,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching events",
					cause: error,
				});
			}
		}),

	addComment: protectedProcedure
		.input(
			z.object({
				reviewId: z.string(),
				content: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const comment = await ctx.prisma.comments.create({
					data: {
						content: input.content,
						reviewId: input.reviewId,
						userId: ctx.session?.user?.id ?? "",
					},
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
								avatarUrl: true,
								email: true,
								role: true,
							},
						},
					},
				});

				return {
					statusCode: 200,
					message: "Comment added successfully",
					data: comment,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error adding comment",
					cause: error,
				});
			}
		}),

	getComments: protectedProcedure
		.input(
			z.object({
				reviewId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const comments = await ctx.prisma.comments.findMany({
					where: {
						reviewId: input.reviewId,
					},
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
								avatarUrl: true,
								email: true,
								role: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				});

				return {
					statusCode: 200,
					message: "Comments fetched successfully",
					data: comments,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching comments",
					cause: error,
				});
			}
		}),

	getFeedbacks: protectedProcedure
		.input(
			z.object({
				isVendorSpecific: z.boolean().optional(),
				page: z.number().default(1),
				limit: z.number().default(10),
				sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
				sortOrder: z.enum(["asc", "desc"]).default("desc"),

				eventId: z.string().optional(),
				rating: z.number().optional(),
				visible: z.boolean().optional(),

				eventSpecificType: z.string().optional(),

				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const {
					page,
					limit,
					sortBy,
					sortOrder,
					eventId,
					rating,
					visible,
					search,
					eventSpecificType,
					isVendorSpecific,
				} = input;
				const skip = (page - 1) * limit;

				// Build where conditions
				const whereConditions: Prisma.reviewsWhereInput = {
					// Base filters
					...(eventId && { events: { id: eventId } }),
					...(rating && { rating: rating }),
					...(visible !== undefined && {
						visible: visible,
					}),
					...(eventSpecificType && { eventSpecificType: eventSpecificType }),

					// Search in comments
					...(search && {
						OR: [
							{ comment: { contains: search, mode: "insensitive" } },
							{ users: { firstName: { contains: search, mode: "insensitive" } } },
							{ users: { lastName: { contains: search, mode: "insensitive" } } },
							{ events: { title: { contains: search, mode: "insensitive" } } },
						],
					}),
				};

				if (isVendorSpecific) {
					whereConditions.events = {
						vendorId: ctx.session?.user?.id,
					};
				}

				if (eventId) {
					whereConditions.events = {
						id: eventId,
					};
				}

				// console.log("whereConditions", whereConditions);

				// Get reviews with pagination and sorting
				const [reviews, total] = await Promise.all([
					ctx.prisma.reviews.findMany({
						where: whereConditions,
						include: {
							events: {
								select: {
									id: true,
									title: true,
									eventSpecificType: true,
									sportType: true,
								},
							},
							users: {
								select: {
									id: true,
									username: true,
									firstName: true,
									lastName: true,
									avatarUrl: true,
									buyer: true,
									email: true,
								},
							},
							comments: {
								include: {
									user: {
										select: {
											firstName: true,
											lastName: true,
											avatarUrl: true,
											email: true,
											role: true,
										},
									},
								},
								orderBy: {
									createdAt: "asc",
								},
							},
						},
						skip,
						take: limit,
						orderBy: {
							[sortBy]: sortOrder,
						},
					}),
					ctx.prisma.reviews.count({
						where: whereConditions,
					}),
				]);

				console.log("reviews", reviews.length);

				return {
					statusCode: 200,
					message: "Feedbacks fetched successfully",
					data: {
						reviews: reviews.map((review) => ({
							id: review.id,
							rating: review.rating,
							comment: review.comment,
							createdAt: review.createdAt,
							updatedAt: review.updatedAt,
							avatarUrl: review.users?.avatarUrl,
							email: review.users?.email,
							name: review.users?.firstName
								? review.users?.firstName + " " + (review.users?.lastName ?? "")
								: "",
							eventTitle: review.events?.title,
							eventSpecificType: review.events?.eventSpecificType,
							sportType: review.events?.sportType,
							comments: review.comments,
						})),
						pagination: {
							total,
							pages: Math.ceil(total / limit),
							page,
							limit,
						},
					},
				};
			} catch (error) {
				console.log("error", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error fetching feedbacks",
					cause: error,
				});
			}
		}),
	// Get feedback for an event
	getFeedback: publicProcedure
		.input(
			z.object({
				eventId: z.string(),
				userId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { eventId, userId } = input;

			const feedback = await prisma.reviews.findFirst({
				where: {
					eventId: eventId,
					userId,
				},
				select: {
					rating: true,
					comment: true,
					createdAt: true,
				},
			});

			console.log("feedback", feedback);

			return feedback;
		}),

	// Add feedback for an event
	updateComment: protectedProcedure
		.input(
			z.object({
				commentId: z.string(),
				content: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const comment = await ctx.prisma.comments.findUnique({
					where: { id: input.commentId },
					include: { user: true },
				});

				if (!comment) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Comment not found",
					});
				}

				// Check if the user is the owner of the comment and is a vendor
				if (comment.userId !== ctx.session?.user?.id || comment.user.role !== "VENDOR") {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Not authorized to edit this comment",
					});
				}

				const updatedComment = await ctx.prisma.comments.update({
					where: { id: input.commentId },
					data: { content: input.content },
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
								avatarUrl: true,
								email: true,
								role: true,
							},
						},
					},
				});

				return {
					statusCode: 200,
					message: "Comment updated successfully",
					data: updatedComment,
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error updating comment",
					cause: error,
				});
			}
		}),

	deleteComment: protectedProcedure
		.input(
			z.object({
				commentId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const comment = await ctx.prisma.comments.findUnique({
					where: { id: input.commentId },
					include: { user: true },
				});

				if (!comment) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Comment not found",
					});
				}

				// Check if the user is the owner of the comment and is a vendor, or is an admin
				const isAdmin = ctx.session?.user?.role === "ADMIN";
				if (!isAdmin && (comment.userId !== ctx.session?.user?.id || comment.user.role !== "VENDOR")) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Not authorized to delete this comment",
					});
				}

				await ctx.prisma.comments.delete({
					where: { id: input.commentId },
				});

				return {
					statusCode: 200,
					message: "Comment deleted successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error deleting comment",
					cause: error,
				});
			}
		}),

	deleteReview: protectedProcedure
		.input(
			z.object({
				reviewId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				// First delete all comments associated with the review
				await ctx.prisma.comments.deleteMany({
					where: { reviewId: input.reviewId },
				});

				// Then delete the review itself
				await ctx.prisma.reviews.delete({
					where: { id: input.reviewId },
				});

				return {
					statusCode: 200,
					message: "Review deleted successfully",
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error deleting review",
					cause: error,
				});
			}
		}),

	rateEvent: publicProcedure
		.input(
			z.object({
				eventId: z.string(),
				userId: z.string(),
				rating: z.number().min(1).max(5),
				comment: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const { eventId, userId, rating, comment } = input;

			const newRating = await prisma.reviews.upsert({
				where: {
					id: await prisma.reviews
						.findFirst({
							where: {
								eventId: eventId,
								userId,
							},
						})
						.then((r) => r?.id ?? ""),
				},
				update: {
					rating,
					comment,
					updatedAt: new Date(),
				},
				create: {
					eventId: eventId,
					userId,
					rating,
					comment,
					visible: true,
				},
			});

			return newRating;
		}),
});
