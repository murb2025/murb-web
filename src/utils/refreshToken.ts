import { NextRequest, NextResponse } from "next/server";

export async function refreshToken(req: NextRequest) {
	const refreshToken = req.cookies.get("refreshToken")?.value;

	if (!refreshToken) {
		throw new Error("No refresh token found");
	}

	const refreshResponse = await fetch(`${process.env.NESTJS_API_URL}/refresh`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ refreshToken }),
	});

	if (!refreshResponse.ok) {
		throw new Error("Failed to refresh token");
	}

	const { accessToken } = await refreshResponse.json();

	// Set new access token in the response cookies
	const res = NextResponse.next();
	res.cookies.set("token", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60, // 1 hour
		path: "/",
	});

	return res;
}
