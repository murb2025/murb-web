import { Metadata } from "next";
import Navbar from "@/components/Buyer/nav/Navbar";
import React from "react";
import Footer from "@/components/LandingPage/Footer";

export const metadata: Metadata = {
	title: "Murb | About Us",
	description: "All sports, one platform! Book all sports activities and venue in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<div className="w-full mt-12">{children}</div>
			<Footer />
		</>
	);
}
