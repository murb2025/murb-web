import Cookies from "js-cookie";
import { IOtpRequest, IOtpResponse, IOtpVerification, IUser, IUserResponse } from "@/types/user.type";
import http from "@/connections/http";

export const verifyUserIfLoggedIn = async (): Promise<{
	message: string;
	data: IUser;
}> => {
	try {
		const response = await http.get("/auth/verify");
		return Promise.resolve(response.data);
	} catch (error: any) {
		console.error(error);
		return Promise.reject(error.response.data);
	}
};
const setCookie = async (accessToken: string, refreshToken: string) => {
	// Call the API route to set cookies
	await fetch("/api/set-auth-cookies", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			accessToken: accessToken,
			refreshToken: refreshToken,
		}),
	});
};

// verify otp
export const verifyOtp = async (data: Partial<IOtpVerification>): Promise<IUserResponse> => {
	try {
		const response = await http.post("/auth/users", data);
		if (response.data.data.accessToken && response.data.data.refreshToken) {
			Cookies.set("accessToken", response.data.data.accessToken, {
				secure: true,
				sameSite: "strict",
			});
			Cookies.set("refreshToken", response.data.data.refreshToken, {
				secure: true,
				sameSite: "strict",
			});
			setCookie(response.data.data.accessToken, response.data.data.refreshToken);
		}
		return Promise.resolve(response.data);
	} catch (error: any) {
		console.error(error);
		return Promise.reject(error.response.data);
	}
};

//send otp to email
export const sendOtp = async (data: Partial<IOtpRequest>): Promise<IOtpResponse> => {
	try {
		const response = await http.post("/auth/otps", data);
		return Promise.resolve(response.data);
	} catch (error: any) {
		console.error(error);
		return Promise.reject(error.response.data);
	}
};

//refresh token
export const refreshToken = async (refreshToken: string): Promise<any> => {
	try {
		const response = await http.post("/auth/refresh", { refreshToken });
		if (response.data?.data?.accessToken && response.data.data.refreshToken) {
			Cookies.set("accessToken", response.data.data.accessToken, {
				secure: true,
				sameSite: "strict",
			});
			Cookies.set("refreshToken", response.data.data.refreshToken, {
				secure: true,
				sameSite: "strict",
			});
		}
		return Promise.resolve(response.data);
	} catch (error: any) {
		return Promise.reject(error.response.data);
	}
};

//verify token
export const verifyToken = async (accessToken: string) => {
	try {
		const response = await http.post("/auth/verify", { accessToken });
		return Promise.resolve(response.data);
	} catch (error: any) {
		console.error(error);
		return Promise.reject(error.response.data);
	}
};

//get event categories
export const getCategories = async () => {
	try {
		const response = await http.get("/categories");
		return Promise.resolve(response.data);
	} catch (error: any) {
		// console.error(error);
		return Promise.reject(error.response.data);
	}
};

//get event types
export const getEventTypes = async () => {
	try {
		const response = await http.get("/event-types");
		return Promise.resolve(response.data);
	} catch (error: any) {
		console.error(error);
		return Promise.reject(error.response.data);
	}
};
