import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({ error: "Cookie name is required" });
		}

		const cookieValue = req.cookies[name];

		if (cookieValue) {
			res.status(200).json({ [name]: cookieValue });
		} else {
			res.status(404).json({ error: `Cookie '${name}' not found` });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
