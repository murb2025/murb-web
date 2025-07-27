import constants from "@/constants";
import axios from "axios";

export const uploadToServer = async (files: File[]) => {
	// console.log("uploading files...", files);
	try {
		const formData = new FormData();

		formData.append("file", files[0]);

		const response = await axios.post(`${constants.variables.backendBaseUrl}/medias`, formData, {
			headers: {
				"Content-Type": "multipart/form-data; boundary=<calculated when request is sent>",
			},
		});
		// console.log("uploading file response", response?.data?.data?.key);
		return response?.data?.data.key;
	} catch (error) {
		// console.error("Error uploading files:", error);
		throw error;
	}
};
