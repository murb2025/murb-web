"use client";
import Onboarding from "@/components/Onboarding";
import { useSession } from "next-auth/react";
import React from "react";

const OnboardingPage = () => {
	const { data: session } = useSession();
	const user = session?.user;
	// console.log("userData->>>>>>>>>>>>>>>>>>>>", user);
	return (
		<div className="flex flex-col w-full">
			<Onboarding userData={user as any} />
		</div>
	);
};

export default OnboardingPage;
