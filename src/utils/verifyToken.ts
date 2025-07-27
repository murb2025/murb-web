import { http } from "@/connections";

export async function verifyToken(data: { accessToken: string }) {
	try {
		const response = await http.post("/auth/verify", data);
		return Promise.resolve(response.data);
	} catch (error: any) {
		console.error(error);
		return Promise.reject(error.response.data);
	}
}
