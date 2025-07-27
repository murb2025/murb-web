import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ReportIssue from "@/components/ReportIssue";
import React from "react";
import Providers from "@/app/provider";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

export const metadata: Metadata = {
	title: "Murb",
	description: "All sports, one platform! Book all sports activities and venue in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<GoogleTagManager gtmId="G-VJSMXMP34Y" />
			<body>
				<Providers>
					<>{children}</>
					<ReportIssue />
					<Toaster
						position="top-center"
						toastOptions={{
							duration: 2500,
						}}
					/>
				</Providers>
				<GoogleAnalytics gaId="G-VJSMXMP34Y" />
			</body>
		</html>
	);
}
