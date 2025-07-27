import { Metadata } from "next";
import Navbar from "@/components/Dashboard/Navbar";
import React from "react";

export const metadata: Metadata = {
	title: "Murb | VENDOR",
	description: "All sports, one platform! Book all sports activities and venue in one place.",
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			<div className="w-full">{children}</div>
		</>
	);
}
