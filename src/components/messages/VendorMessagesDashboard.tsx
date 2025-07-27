"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SenderList, { ISenderList } from "./SenderList";
import MessageList from "./MessageList";
import { trpc } from "@/app/provider";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import NothingFound from "../NothingFound";
import { Loader } from "lucide-react";

export default function VendorMessagesDashboard() {
	const [activeUser, setActiveUser] = useState<ISenderList | null>(null);

	const searchParams = useSearchParams();
	const receiverId = searchParams.get("receiverId") as string;

	const { data: session } = useSession();

	const { data: isBuyer, isLoading: isCheckBuyerLoading } = trpc.chat.checkBuyer.useQuery(
		{
			userId: receiverId,
		},
		{
			enabled: !!session?.user?.id && !!receiverId,
		},
	);

	return (
		<div className="flex w-full flex-col bg-white overflow-auto">
			<header className="flex justify-between items-center">
				<h1 className="text-black text-2xl font-medium mb-4">Inbox</h1>
			</header>

			<div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-5 h-screen px-2 md:px-4">
				{/* Sidebar */}
				<SenderList onActiveUserChange={setActiveUser} />
				{/* Main Chat Area */}

				{receiverId ? (
					!isCheckBuyerLoading ? (
						isBuyer?.success ? (
							<>
								<MessageList activeUser={activeUser} />
							</>
						) : (
							<NothingFound />
						)
					) : (
						<div
							className={`flex-1 border border-[#D2D2D2] rounded-[15px] flex justify-center items-center flex-col h-[75vh] ${receiverId ? "" : "hidden md:block"}`}
						>
							<Loader className="w-10 h-10 animate-spin" />
						</div>
					)
				) : (
					<>
						<MessageList activeUser={activeUser} />
					</>
				)}
			</div>
		</div>
	);
}
