import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { NextApiResponse } from "next";
import { Socket } from "net";

export interface SocketServer extends HTTPServer {
	io?: SocketIOServer;
}

export interface SocketWithServer extends Socket {
	server: SocketServer;
}

export interface NextApiResponseServerIO extends NextApiResponse {
	socket: SocketWithServer;
}
