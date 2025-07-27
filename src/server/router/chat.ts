import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const chatRouter = router({
	// Check Buyer
	checkBuyer: protectedProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const user = await ctx.prisma.bookings.findFirst({
				where: {
					userId: input.userId,
				},
			});
			return { success: true };
		}),

	// check if user has a booking
	checkBooking: protectedProcedure
		.input(
			z.object({
				receiverId: z.string(),
				userId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const hasBooking = await ctx.prisma.bookings.findFirst({
				where: {
					userId: input.userId,
					status: "SUCCESS",
					event: {
						vendorId: input.receiverId,
					},
				},
				include: {
					event: true,
				},
			});
			return { hasBooking: !!hasBooking };
		}),
	// Get message senders
	getMessageSenders: publicProcedure.query(async ({ ctx }) => {
		try {
			// Step 1: Get unique sender IDs with their last message
			const messages = await ctx.prisma.message.findMany({
				where: { receiverId: ctx?.session?.user?.id },
				orderBy: { createdAt: "desc" }, // Order by latest message
				distinct: ["senderId"], // Get only one message per sender
				include: {
					sender: {
						include: {
							vendor: true,
						},
					},
				},
			});

			// Step 2: Map results into a structured format
			const result = messages.map((message: any) => ({
				senderId: message.senderId,
				senderDetails: message.sender,
				lastMessage: {
					id: message.id,
					content: message.content,
					createdAt: message.createdAt,
				},
			}));

			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: (error as any).message };
		}
	}),

	// Get messages between users
	getMessages: protectedProcedure
		.input(
			z.object({
				receiverId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			try {
				// const isBuyer = await ctx.prisma.bookings.findFirst({
				// 	where: {
				// 		userId: input.receiverId,
				// 		status: "SUCCESS",
				// 	},
				// });

				// if (!isBuyer) {
				// 	throw new Error("You must book a ticket before sending messages");
				// }

				const messages = await ctx.prisma.message.findMany({
					where: {
						OR: [
							{
								senderId: ctx?.session?.user?.id,
								receiverId: input.receiverId,
							},
							{
								senderId: input.receiverId,
								receiverId: ctx?.session?.user?.id,
							},
						],
					},
					orderBy: { createdAt: "asc" },
				});
				return { success: true, data: messages };
			} catch (error) {
				return { success: false, error: (error as any).message };
			}
		}),

	// Create a new message
	createMessage: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1),
				receiverId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			try {
				if (!ctx.session?.user?.id) {
					throw new Error("Unauthorized");
				}

				// const hasBooking = await ctx.prisma.bookings.findFirst({
				// 	where: {
				// 		userId: ctx.session.user.id,
				// 		status: "SUCCESS", // Adjust status as needed
				// 	},
				// });

				// if (!hasBooking) {
				// 	throw new Error(
				// 		"You must book a ticket before sending messages",
				// 	);
				// }

				const message = await ctx.prisma.message.create({
					data: {
						content: input.content,
						senderId: ctx.session.user.id,
						receiverId: input.receiverId,
					},
				});

				// if (ctx?.io) {
				// 	const room = `chat_${Math.min(ctx.session.user.id, input.receiverId)}_${Math.max(ctx.session.user.id, input.receiverId)}`;
				// 	ctx.io.to(room).emit("newMessage", message);
				// }

				return { success: true, data: message };
			} catch (error) {
				console.error("Create message error:", error);
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),

	// WebSocket connection handler
	// onConnection: publicProcedure.query(({ ctx }) => {
	// 	if (!ctx?.ee) {
	// 		console.warn("Socket.io instance not found in context");
	// 		return {
	// 			success: false,
	// 			error: "WebSocket server not initialized",
	// 		};
	// 	}

	// 	// Move socket event handlers to the socket route
	// 	// This procedure should only check if the connection is available
	// 	return { success: true };
	// }),

	// Join chat room with enhanced error handling
	// joinRoom: publicProcedure
	// 	.input(
	// 		z.object({
	// 			userId: z.number(),
	// 			targetUserId: z.number(),
	// 		}),
	// 	)
	// 	.mutation(({ input, ctx }) => {
	// 		if (!ctx?.io) {
	// 			throw new Error("WebSocket server not initialized");
	// 		}

	// 		const room = `chat_${Math.min(input.userId, input.targetUserId)}_${Math.max(input.userId, input.targetUserId)}`;

	// 		try {
	// 			ctx.io.to(room).emit("joinedRoom", {
	// 				room,
	// 				userId: input.userId,
	// 				timestamp: new Date().toISOString(),
	// 			});

	// 			return {
	// 				success: true,
	// 				room,
	// 				message: `Successfully joined room: ${room}`,
	// 			};
	// 		} catch (error) {
	// 			console.error("Error joining room:", error);
	// 			return {
	// 				success: false,
	// 				error: "Failed to join room",
	// 			};
	// 		}
	// 	}),

	// Leave chat room with enhanced error handling
	// leaveRoom: publicProcedure
	// 	.input(
	// 		z.object({
	// 			userId: z.number(),
	// 			targetUserId: z.number(),
	// 		}),
	// 	)
	// 	.mutation(({ input, ctx }) => {
	// 		if (!ctx?.io) {
	// 			throw new Error("WebSocket server not initialized");
	// 		}

	// 		const room = `chat_${Math.min(input.userId, input.targetUserId)}_${Math.max(input.userId, input.targetUserId)}`;

	// 		try {
	// 			ctx.io.to(room).emit("leftRoom", {
	// 				room,
	// 				userId: input.userId,
	// 				timestamp: new Date().toISOString(),
	// 			});

	// 			return {
	// 				success: true,
	// 				room,
	// 				message: `Successfully left room: ${room}`,
	// 			};
	// 		} catch (error) {
	// 			console.error("Error leaving room:", error);
	// 			return {
	// 				success: false,
	// 				error: "Failed to leave room",
	// 			};
	// 		}
	// 	}),
});
