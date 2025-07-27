import axios from "axios";

export const getCookie = async (name: string) => {
	try {
		const res = await axios.post("/api/auth/get-cookie", {
			name,
		});

		return res.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
