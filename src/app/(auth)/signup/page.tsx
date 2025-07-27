"use client";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CreateAccountDesktop from "./desktop";
import Onboarding from "@/components/Onboarding";
import { useSession } from "next-auth/react";

const CreateAccount = () => {
	const [setupAccount, setSetupAccount] = useState(false);
	const [isEmailEditable, setIsEmailEditable] = useState(false);
	const [userId, setUserId] = useState(0);
	const [userEmail, setUserEmail] = useState("");
	const params = useParams();
	const session = useSession();
	const user = session.data?.user;

	const onboarding = params.onboarding;
	const event = params.event;

	const searchParams = useSearchParams();

	let accountRole = searchParams.get("role");
	if (accountRole != "BUYER" && accountRole != "VENDOR") {
		accountRole = null;
	}

	useEffect(() => {
		if (onboarding === "true") {
			setSetupAccount(true);
		}
		if (event) {
			setIsEmailEditable(true);
		}
		// eslint-disable-next-line
	}, [onboarding]);

	return (
		<>
			{setupAccount ? (
				<Onboarding userData={user as any} />
			) : (
				<CreateAccountDesktop
					handleAccountSetup={setSetupAccount}
					accountRole={accountRole}
					handleUserData={(id, email) => {
						setUserId(id);
						email && setUserEmail(email);
					}}
				/>
			)}
		</>
	);
};

export default CreateAccount;
