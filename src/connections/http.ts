// lib/http.ts
import constants from "@/constants";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const http = axios.create({
	baseURL: constants.variables.backendBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
});

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else if (token) {
			promise.resolve(token);
		}
	});
	failedQueue = [];
};

// Request interceptor
http.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = Cookies.get("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor
http.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as any;

		if (error.response?.status !== 401 || originalRequest._retry) {
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return http(originalRequest);
				})
				.catch((err) => Promise.reject(err));
		}

		originalRequest._retry = true;
		isRefreshing = true;

		try {
			const refreshToken = Cookies.get("refreshToken");
			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			const response = await axios.post(
				`${constants.variables.backendBaseUrl}/auth/refresh`,
				{ token: refreshToken },
				{
					headers: { "Content-Type": "application/json" },
				},
			);

			const { accessToken, refreshToken: newRefreshToken } = response.data;

			// Update cookies
			Cookies.set("accessToken", accessToken, {
				expires: 10, // 10 days
				secure: process.env.NODE_ENV !== "development",
				sameSite: "strict",
			});

			Cookies.set("refreshToken", newRefreshToken, {
				expires: 30, // 30 days
				secure: process.env.NODE_ENV !== "development",
				sameSite: "strict",
			});

			// Update header for future requests
			http.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
			originalRequest.headers.Authorization = `Bearer ${accessToken}`;

			processQueue(null, accessToken);
			return http(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError, null);

			// Clear auth cookies
			Cookies.remove("accessToken");
			Cookies.remove("refreshToken");

			// Redirect to login if in browser
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}

			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);

export default http;
