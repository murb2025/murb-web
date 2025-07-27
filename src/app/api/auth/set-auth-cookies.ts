import { NextApiRequest, NextApiResponse } from "next";

export function serializeCookie(name: string, value: string, options: any = {}) {
	let str = `${name}=${encodeURIComponent(value)}`;

	if (options.maxAge) {
		str += `; Max-Age=${options.maxAge}`;
	}

	if (options.domain) {
		str += `; Domain=${options.domain}`;
	}

	if (options.path) {
		str += `; Path=${options.path}`;
	}

	if (options.expires) {
		str += `; Expires=${options.expires.toUTCString()}`;
	}

	if (options.httpOnly) {
		str += "; HttpOnly";
	}

	if (options.secure) {
		str += "; Secure";
	}

	if (options.sameSite) {
		str += `; SameSite=${options.sameSite}`;
	}

	return str;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const { accessToken, refreshToken } = req.body;

		const accessTokenCookie = serializeCookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			sameSite: "strict",
			maxAge: 10 * 24 * 60 * 60, // 10 days
			path: "/",
		});

		const refreshTokenCookie = serializeCookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			sameSite: "strict",
			maxAge: 30 * 24 * 60 * 60, // 30 days
			path: "/",
		});

		res.setHeader("Set-Cookie", [accessTokenCookie, refreshTokenCookie]);

		res.status(200).json({ success: true });
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
