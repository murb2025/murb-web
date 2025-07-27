import { createServer } from "node:http";
import { Server } from "socket.io";

const hostname = "localhost";
const socketPort = process.env.NEXT_PUBLIC_WS_PORT || 4000; // Port for Socket.io server

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "*", // Allow your Next.js app
		methods: ["GET", "POST"],
	},
	transports: ["websocket"],
});

// Keep track of connected users
const userSocketMap = new Map();

// Health check endpoint
httpServer.on("request", (req, res) => {
	if (req.url === "/health" && req.method === "GET") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ status: "healthy" }));
	}
});

io.on("connection", (socket) => {
	console.log("Socket connected:", socket.id);

	socket.on("join", ({ userId, targetUserId }) => {
		console.log(`User ${userId} joined`);
		userSocketMap.set(userId, socket.id);
	});

	socket.on("message", (message) => {
		console.log("Message received:", message);
		const receiverSocketId = userSocketMap.get(message.receiverId);

		// Send to receiver if online
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("message", message);
		}

		// Send back to sender for confirmation
		socket.emit("message", message);
	});

	socket.on("leave", ({ userId }) => {
		userSocketMap.delete(userId);
	});

	socket.on("disconnect", () => {
		// Clean up user socket mapping
		for (const [userId, socketId] of userSocketMap.entries()) {
			if (socketId === socket.id) {
				userSocketMap.delete(userId);
			}
		}
		console.log("Socket disconnected:", socket.id);
	});
});

httpServer.listen(socketPort, () => {
	console.log(`Socket.io server is running on http://${hostname}:${socketPort}`);
});
