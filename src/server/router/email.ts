import { router, publicProcedure } from "@/server/trpc";
import moment from "moment-timezone";
import * as nodemailer from "nodemailer";
import { z } from "zod";

export const emailRouter = router({
	sendOtpEmail: publicProcedure
		.input((input: any) => input)
		.mutation(async ({ input }) => {
			const { email, otp, expiresAt } = input;

			// Initialize nodemailer transporter
			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: process.env.SMTP_EMAIL,
					pass: process.env.SMTP_PASSWORD,
				},
			});

			const mailOptions = {
				from: process.env.SMTP_EMAIL,
				to: email,
				subject: "Your Murb Verification Code",
				text: `Your verification code is ${otp}. It expires at ${moment(expiresAt).tz("Asia/Kolkata").format("DD, MMM YYYY HH:mm:ss a")} IST.`,
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #cfad87;">
						<div style="text-align: center; margin-bottom: 30px;">
							<img src="https://www.murb.in/brand/brand-logo-black.svg" alt="Murb Logo" style="width: 150px;">
						</div>
						<div style="background-color: #fffcf9 !important; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
							<h1 style="color: #333; text-align: center; margin-bottom: 20px;">Verification Code</h1>
							<div style="background-color: #f5f5f5 !important; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
								<span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</span>
							</div>
							<p style="color: #666; text-align: center; margin-bottom: 20px;">
								Please use this code to verify your account. This code will expire at ${moment(expiresAt).tz("Asia/Kolkata").format("DD, MMM YYYY hh:mm:ss a")} IST.
							</p>
							<p style="color: #999; font-size: 12px; text-align: center;">
								If you didn't request this code, please ignore this email.
							</p>
						</div>
						<div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
							<p>© ${new Date().getFullYear()} Murb. All rights reserved.</p>
						</div>
					</div>
				`,
			};

			try {
				await transporter.sendMail(mailOptions);
				console.log(`OTP sent successfully to ${email}`);
			} catch (error) {
				console.error(`Error occurred while sending OTP email: ${error}`);
				throw new Error("Error occurred while sending OTP email");
			}
		}),
	sendOrganizerEmail: publicProcedure
		.input(
			z.object({
				email: z.string(),
				name: z.string(),
				phone: z.string(),
				location: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { email, name, phone, location } = input;

			try {
				const foundUser = await ctx.prisma.users.findUnique({
					where: {
						email,
					},
					include: {
						vendor: true,
						buyer: true,
						admin: true,
					},
				});

				if (foundUser && foundUser.role === "VENDOR") {
					return {
						success: false,
						message: "Provided email is already a registered organizer",
					};
				}

				// Update user and send email in a transaction
				const updatedUser = await ctx.prisma.users.update({
					where: { email },
					data: {
						firstName: name.split(" ")[0],
						lastName: name.split(" ").splice(1).join(" "),
						mobileNumber: phone,
						role: "VENDOR",
						buyer: {
							upsert: {
								create: {
									address: location,
								},
								update: {
									address: location,
								},
							},
						},
					},
					include: {
						vendor: true,
						buyer: true,
						admin: true,
					},
				});
				// Initialize nodemailer transporter
				const transporter = nodemailer.createTransport({
					service: "gmail",
					auth: {
						user: process.env.SMTP_EMAIL,
						pass: process.env.SMTP_PASSWORD,
					},
				});

				// Send confirmation email to organizer
				const organizerMailOptions = {
					from: process.env.SMTP_EMAIL,
					to: email,
					subject: "Welcome to Murb as an Organizer!",
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #cfad87;">
							<div style="text-align: center; margin-bottom: 30px;">
								<img src="https://www.murb.in/brand/brand-logo-black.svg" alt="Murb Logo" style="width: 150px;">
							</div>
							<div style="background-color: #fffcf9 !important; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
								<h1 style="color: #333; text-align: center; margin-bottom: 20px;">Welcome to Murb!</h1>
								<p style="color: #666; text-align: center; margin-bottom: 20px;">
								Dear ${name},
								</p>
								<p style="color: #666; text-align: center; margin-bottom: 20px;">
								Congratulations! Your vendor account has been successfully approved. You can now start listing on the Murb platform.
								</p>
								<p style="color: #666; text-align: center; margin-bottom: 20px;">
								Access your vendor dashboard to manage listings, view analytics, and more.
								</p>
								<div style="text-align: center; margin: 30px 0;">
								<a href=${`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/vendor/dashboard`}
									style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
									Host Dashboard
								</a>
								<a href=${`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/create`}
									style="background-color: #cfad87; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
									Create Listing
								</a>
								</div>
							</div>
							<div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
								<p>© ${new Date().getFullYear()} Murb. All rights reserved.</p>
							</div>
							</div>
					`,
				};

				await transporter.sendMail(organizerMailOptions);

				return {
					success: true,
					message: "Request Successful. Please check your email for further details.",
					user: updatedUser, // Return the updated user data
				};
			} catch (error: any) {
				console.error(`Error occurred while sending organizer email: ${error}`);
				return {
					success: false,
					message: error.message || "Error occurred while sending organizer email",
				};
			}
		}),
});
