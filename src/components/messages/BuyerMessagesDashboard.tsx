"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SenderList, { ISenderList } from "./SenderList";
import MessageList from "./MessageList";
import { trpc } from "@/app/provider";
import { useSession } from "next-auth/react";
import NothingFound from "../NothingFound";
import { Loader, Loader2 } from "lucide-react";

export default function BuyerMessagesDashboard() {
	const [activeUser, setActiveUser] = useState<ISenderList | null>(null);

	const searchParams = useSearchParams();
	const receiverId = searchParams.get("receiverId") as string;

	const { data: session } = useSession();

	const { data, isLoading: isCheckBookingLoading } = trpc.chat.checkBooking.useQuery(
		{
			userId: session?.user?.id!,
			receiverId: receiverId,
		},
		{
			enabled: !!session?.user?.id && receiverId !== undefined,
		},
	);

	console.log(data, isCheckBookingLoading);

	return (
		<div className="flex w-full flex-col">
			<header className="flex justify-between items-center">
				<h1 className="text-3xl font-bold mb-4">Inbox</h1>
			</header>

			<div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-5 h-screen px-2 md:px-4">
				{/* Sidebar */}
				<SenderList onActiveUserChange={setActiveUser} />
				{/* Main Chat Area */}

				{receiverId ? (
					!isCheckBookingLoading ? (
						data?.hasBooking ? (
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
