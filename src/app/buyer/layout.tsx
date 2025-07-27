import { Metadata } from "next";
import Navbar from "@/components/Buyer/nav/Navbar";
import React from "react";
import Footer from "@/components/LandingPage/Footer";
export const metadata: Metadata = {
	title: "Murb | BUYER",
	description: "All sports, one platform! Book all sports activities and venue in one place.",
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col min-h-screen">
			<Navbar />
			<main className="flex-1 w-full mt-[5.5rem] md:mt-[7.5rem] px-3 md:px-10 lg:px-20 pb-4">{children}</main>
			<Footer />
		</div>
	);
}
