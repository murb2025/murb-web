import http from "@/connections/http";
import { IUser } from "@/types/user.type";

export const getAllUsers = async () => {
	try {
		const res = await http.get("/users");
		return Promise.resolve(res.data);
	} catch (error) {
		console.error(error);
		return Promise.reject(error);
	}
};

export const updateUser = async (id: string, data: Partial<IUser>) => {
	try {
		// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>");
		const res = await http.patch(`users/${id}`, data);
		return Promise.resolve(res.data);
	} catch (error) {
		console.error(error);
		return Promise.reject(error);
	}
};
