import { Metadata } from "next";
import Navbar from "@/components/Buyer/nav/Navbar";
import React from "react";
import Footer from "@/components/LandingPage/Footer";

export const metadata: Metadata = {
	title: "Murb | Sports Checkout",
	description: "All sports, one platform! Book all sports activities and venue in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />

			<div className="w-full container mx-auto md:p-8 p-4 mt-24 overflow-y-auto">{children}</div>
			<Footer />
		</>
	);
}
