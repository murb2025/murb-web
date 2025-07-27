import http from "../http";
import { getCookie } from "./cookies.api";

export const fetchSendersList = async (): Promise<any> => {
	try {
		const token = await getCookie("accessToken");
		const response = await http.get("/messages/senders", {
			headers: {
				Authorization: `Bearer ${token.accessToken}`,
			},
		});
		return Promise.resolve(response.data);
	} catch (error) {
		console.error("Failed to fetch senders list:", error);
		throw new Error("Failed to fetch senders list");
	}
};

export const fetchMessage = async (selectedUserId: number): Promise<any> => {
	try {
		const token = await getCookie("accessToken");
		const response = await http.get(`/messages?receiverId=${selectedUserId}`, {
			headers: {
				Authorization: `Bearer ${token.accessToken}`,
			},
		});
		return Promise.resolve(response.data);
	} catch (error) {
		console.error("Failed to fetch messages:", error);
		throw new Error("Failed to fetch messages");
	}
};
