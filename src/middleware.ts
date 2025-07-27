import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAdminEmail } from "./utils/helper";

export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});
	const { pathname } = request.nextUrl;

	const userRole = token?.role; // Assuming the role is part of the JWT payload
	const userEmail = token?.email || "";

	// public route
	if (pathname === "/") {
		return NextResponse.next();
	}

	if (token && (pathname === "/login" || pathname === "/signup")) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (!token && (pathname === "/login" || pathname === "/signup")) {
		return NextResponse.next();
	}

	if (pathname === "/login" || pathname === "/signup") {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Role-based route access
	// Admin routes
	if (pathname.startsWith("/admin")) {
		if (isAdminEmail(userEmail) || userRole === "ADMIN") {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Buyer routes
	if (pathname.startsWith("/buyer")) {
		if (userRole === "BUYER" || userRole === "VENDOR") {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Vender routes
	if (pathname.startsWith("/vendor")) {
		if (userRole === "VENDOR") {
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|event/create|event/detail/*|event/checkout/*).*)"],
};
