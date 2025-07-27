import { reportIssueApi } from "@/connections/api/reportIssue.api";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		await reportIssueApi(req, res);
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
}
