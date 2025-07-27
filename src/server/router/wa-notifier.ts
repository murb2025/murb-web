import { router, publicProcedure } from "@/server/trpc";
import moment from "moment-timezone";
import * as nodemailer from "nodemailer";
import { z } from "zod";

const WA_NOTIFIER_API_KEY = process.env.WA_NOTIFIER_API_KEY;
const WA_NOTIFIER_URL = process.env.WA_NOTIFIER_URL || "https://app.wanotifier.com/api/v1/send";

interface SendMessageParams {
	to: string; // Phone number in international format (e.g., 6281234567890)
	message: string; // Text message to send
	template?: string; // Optional template name if using templates
}

export const sendWhatsAppMessage = async ({ to, message, template }: SendMessageParams) => {
	try {
		// Format the phone number if needed (remove any + sign and spaces)
		const formattedNumber = to.replace(/\+|\s/g, "");

		// Check if the API key is available
		if (!WA_NOTIFIER_API_KEY) {
			throw new Error("WhatsApp Notifier API key is not configured");
		}

		console.log(`Sending WhatsApp message to ${formattedNumber} using endpoint: ${WA_NOTIFIER_URL}`);

		const payload = {
			api_key: WA_NOTIFIER_API_KEY,
			to: formattedNumber,
			message,
			...(template && { template }),
		};

		const response = await fetch(WA_NOTIFIER_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		console.log(`Response status: ${response.status}`);

		const data = await response.json();

		if (!response.ok) {
			console.error("Error response from API:", data);
			throw new Error(
				data.message || `Failed to send WhatsApp message: ${response.status} ${response.statusText}`,
			);
		}

		return {
			success: true,
			data,
		};
	} catch (error) {
		console.error("Error sending WhatsApp message:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

export const waNotifierRouter = router({
	sendOtpEmail: publicProcedure
		.input((input: any) => input)
		.mutation(async ({ input }) => {
			const { email, otp, expiresAt } = input;
		}),
});
