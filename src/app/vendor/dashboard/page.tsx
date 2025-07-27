"use client";
import React from "react";
import HomePage from "@/components/Dashboard/HomePage";
import { useSession } from "next-auth/react";

const Dashboard = () => {
	const { data: session } = useSession();
	return (
		<>
			<HomePage vendorId={session?.user.id || ""} isAdmin={false} />
		</>
	);
};

export default Dashboard;
