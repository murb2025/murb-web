import { IFeedbackResponse } from "@/types/feedback.type";
import http from "../http";

export const fetchFeedback = async (
	page: number,
	size: number,
	vendorId: number,
	token: string,
	filter?: string,
	eventId?: string,
): Promise<IFeedbackResponse> => {
	try {
		const response = await http.get(
			`/feedback/${vendorId}?page=${page}&size=${size}&filter=${filter || "newest"}&eventId=${eventId || ""}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		return Promise.resolve(response.data);
	} catch (error) {
		console.error(error);
		throw new Error("Failed to fetch feedbacks");
	}
};
