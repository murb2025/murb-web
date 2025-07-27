import nodemailer from "nodemailer";
import {
	generateBookingConfirmationEmail,
	generateInvoiceHtml,
	IBookingConfirmationPdfData,
} from "./email-templates/booking-confirmation";
import puppeteer from "puppeteer";

interface EmailConfig {
	from: string;
	to: string;
	subject: string;
	html: string;
	attachments?: Array<{
		filename: string;
		content: Buffer;
		contentType: string;
	}>;
}

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SMTP_EMAIL,
		pass: process.env.SMTP_PASSWORD,
	},
});

/**
 * Generates a PDF from HTML content
 * @param html HTML content to convert to PDF
 * @returns Buffer containing the PDF
 */
async function generatePDF(html: string): Promise<Buffer> {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setContent(html);
	const pdf = await page.pdf({ format: "A4" });
	await browser.close();
	return Buffer.from(pdf);
}

/**
 * Sends a booking confirmation email with invoice attachment
 * @param bookingData Booking data for email template
 * @param recipientEmail Email address to send to
 */
export async function sendBookingConfirmationEmail(bookingData: IBookingConfirmationPdfData, recipientEmail: string) {
	try {
		// Generate email content
		const emailHtml = generateBookingConfirmationEmail(bookingData);

		// Generate invoice PDF
		const invoiceHtml = generateInvoiceHtml(bookingData);
		const invoicePdf = await generatePDF(invoiceHtml);

		// Configure email
		const emailConfig: EmailConfig = {
			from: process.env.SMTP_EMAIL!,
			to: recipientEmail,
			subject: `Booking Confirmation - ${bookingData.event?.title}`,
			html: emailHtml,
			attachments: [
				{
					filename: `invoice-${bookingData.id}.pdf`,
					content: invoicePdf,
					contentType: "application/pdf",
				},
			],
		};

		// Send email
		await transporter.sendMail(emailConfig);

		return { success: true };
	} catch (error) {
		console.error("Error sending booking confirmation email:", error);
		throw new Error("Failed to send booking confirmation email");
	}
}
