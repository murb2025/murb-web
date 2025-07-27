// import { RESPONSE_MESSAGES } from "@/constants/enum";
import { updateUser } from "@/connections/api/users.api";
import { ApiRequest, ApiResponse } from "@/types/api.type";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req: ApiRequest, res: ApiResponse) => {
	try {
		const { method } = req;

		if (method === "PATCH") {
			const { id } = req.query;
			const data = req.body;
			if (typeof id === "string") {
				const updatedUser = await updateUser(id, data);
				return res.status(200).json(updatedUser);
			} else {
				return res.status(400).json({ message: "Invalid request: id is required" });
			}
		}
	} catch (error: any) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

export default handler;
