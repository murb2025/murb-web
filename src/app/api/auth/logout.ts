import { NextApiRequest, NextApiResponse } from "next";

function serializeCookie(name: string, value: string, options: any = {}) {
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
		if (req.body.action === "logout") {
			// Clear the cookies by setting them to expire immediately
			res.setHeader("Set-Cookie", [
				`accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; ${process.env.NODE_ENV !== "development" ? "Secure;" : ""} SameSite=Strict`,
				`refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; ${process.env.NODE_ENV !== "development" ? "Secure;" : ""} SameSite=Strict`,
			]);

			res.status(200).json({
				success: true,
				message: "Logged out successfully",
			});
		} else {
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
			res.status(200).json({
				success: true,
				message: "Logged in successfully",
			});
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
