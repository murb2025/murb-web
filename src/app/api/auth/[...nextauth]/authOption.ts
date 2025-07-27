import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/server/db";
import { NextAuthOptions } from "next-auth";
import { AccountStatus, UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			username?: string;
			firstName?: string;
			lastName?: string;
			email?: string;
			mobileNumber?: string;
			avatarUrl?: string;
			accountStatus: AccountStatus;
			role: UserRole;
			createdAt: Date;
			updatedAt: Date;
			vendor?: {
				userId: string;
				govermentPhotoIdUrls: string[];
				aadharNumber?: string;
				bankAccountNumber?: string;
				gstNumber?: string;
				ifscCode?: string;
				panNumber?: string;
				createdAt: Date;
				updatedAt: Date;
			};
			buyer?: {
				userId: string;
				recoveryEmail?: string;
				emergencyMobileNumber?: string;
				address?: string;
				createdAt: Date;
				updatedAt: Date;
			};
			admin?: {
				userId: string;
				createdAt: Date;
				updatedAt: Date;
			};
		} & DefaultSession["user"];
	}
}

export const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	jwt: {
		maxAge: 30 * 24 * 60 * 60,
	},
	providers: [
		CredentialsProvider({
			id: "email-otp",
			name: "Email OTP",
			credentials: {
				email: { label: "Email", type: "email" },
				otp: { label: "OTP", type: "text" },
				role: { label: "Role", type: "text" },
			},
			async authorize(credentials): Promise<any> {
				if (!credentials?.email || !credentials?.otp) {
					throw new Error("Email and OTP required");
				}

				const validOtp = await prisma.otps.findFirst({
					where: {
						email: credentials.email,
						otp: credentials.otp,
					},
				});

				if (!validOtp) {
					throw new Error("Invalid or expired OTP");
				}

				let user = await prisma.users.findUnique({
					where: { email: credentials.email },
					include: {
						vendor: true,
						buyer: true,
						admin: true,
					},
				});

				if (!user) {
					user = await prisma.users.create({
						data: {
							email: credentials.email,
							role: credentials.role ? (credentials.role as UserRole) : "BUYER",
						},
						include: {
							vendor: true,
							buyer: true,
							admin: true,
						},
					});
					await prisma.notifications.create({
						data: {
							userId: user.id,
							message: "Welcome to the platform!",
						},
					});
				}

				if (!user.vendor && user.role === "VENDOR") {
					user = await prisma.users.update({
						where: { id: user.id },
						data: {
							vendor: {
								create: {
									govermentPhotoIdUrls: [],
								},
							},
						},
						include: {
							vendor: true,
							buyer: true,
							admin: true,
						},
					});
				}

				if (user.role === "VENDOR" && !user.vendor?.bankAccountNumber) {
					await prisma.notifications.create({
						data: {
							userId: user.id,
							message: "Please complete your profile to get your payments.",
							link: "/vendor/verification",
						},
					});
				}
				await prisma.otps.delete({ where: { id: validOtp.id } });

				return user;
			},
		}),
	],
	callbacks: {
		async redirect({ url, baseUrl }) {
			// Allow redirects to internal paths
			if (url.startsWith("/")) {
				return `${baseUrl}${url}`;
			}

			// If the URL is already a full URL on your domain
			if (url.startsWith(baseUrl)) {
				return url;
			}

			// Default fallback to /chat
			return `${baseUrl}/`;
		},
		async session({ session, token }) {
			if (session.user) {
				const user = await prisma.users.findUnique({
					where: { id: token.id as string },
					include: {
						vendor: true,
						buyer: true,
						admin: true,
					},
				});
				session.user = {
					...session.user,
					id: token.id as string,
					username: user?.username as string | undefined,
					firstName: user?.firstName as string | undefined,
					lastName: user?.lastName as string | undefined,
					email: user?.email as string | undefined,
					mobileNumber: user?.mobileNumber as string | undefined,
					avatarUrl: user?.avatarUrl as string | undefined,
					accountStatus: user?.accountStatus as AccountStatus,
					role: user?.role as UserRole,
					createdAt: user?.createdAt as Date,
					updatedAt: user?.updatedAt as Date,
					vendor: user?.vendor as any | null,
					buyer: user?.buyer as any | null,
					admin: user?.admin as any | null,
				};

				if (session.user.accountStatus === "SUSPENDED") {
					throw new Error("User account is suspended. Please contact support.");
				}
			}

			return session;
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token = {
					...token,
					id: user.id,
					username: (user as any).username as string | undefined,
					firstName: (user as any).firstName as string | undefined,
					lastName: (user as any).lastName as string | undefined,
					email: user.email as string | undefined,
					mobileNumber: (user as any).mobileNumber as string | undefined,
					avatarUrl: (user as any).avatarUrl as string | undefined,
					accountStatus: (user as any).accountStatus as AccountStatus,
					role: (user as any).role as UserRole,
					createdAt: (user as any).createdAt as Date,
					updatedAt: (user as any).updatedAt as Date,
					vendor: (user as any).vendor as any | null,
					buyer: (user as any).buyer as any | null,
					admin: (user as any).admin as any | null,
				};
			}

			if (trigger === "update" && session) {
				token = { ...token, ...session.user };
			}

			return token;
		},
	},

	secret: process.env.NEXTAUTH_SECRET,
};
