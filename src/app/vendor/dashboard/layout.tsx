import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ReportIssue from "@/components/ReportIssue";
import React from "react";
import Navbar from "@/components/Dashboard/Navbar";
import Sidebar from "@/components/Dashboard/Sidebar";

export const metadata: Metadata = {
	title: "Murb | Host",
	description: "All sports, one platform! Book all sports activities and venue in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="w-full">
			<div className="flex flex-col h-screen bg-white">
				<Navbar />
				<div className="flex flex-1 overflow-y-auto w-full  mt-20">
					<Sidebar />
					<div className="md:p-10 px-4 md:py-6 py-10 overflow-auto flex-1">{children}</div>
				</div>
			</div>
			<ReportIssue />
			<Toaster position="top-center" />
		</div>
	);
}
