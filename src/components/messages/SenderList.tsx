"use client";
import { trpc } from "@/app/provider";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { socket } from "@/server/socket";
import { formatMessageContent } from "./MessageList";

const formatRelativeTime = (timestamp: string) => {
	const now = new Date();
	const messageDate = new Date(timestamp);
	const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

	// Less than a minute
	if (diffInSeconds < 60) {
		return "just now";
	}

	// Less than an hour
	const minutes = Math.floor(diffInSeconds / 60);
	if (minutes < 60) {
		return `${minutes}min ago`;
	}

	// Less than a day
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}

	// Less than a week
	const days = Math.floor(hours / 24);
	if (days < 7) {
		return `${days}d ago`;
	}

	// Less than a month
	if (days < 30) {
		const weeks = Math.floor(days / 7);
		return `${weeks}w ago`;
	}

	// Less than a year
	const months = Math.floor(days / 30);
	if (months < 12) {
		return `${months}mon ago`;
	}

	// More than a year
	const years = Math.floor(days / 365);
	return `${years}y ago`;
};

export interface ISenderList {
	senderId: string;
	senderDetails: {
		id: string;
		username: string | null;
		firstName: string | null;
		lastName: string | null;
		email: string | null;
		mobileNumber: string | null;
		avatarUrl: string | null;
		createdAt: Date;
		updatedAt: Date;
		accountStatus: string;
		role: string;
		vendor?: {
			govermentPhotoIdUrls: string[];
		};
	};
	lastMessage: {
		id: string;
		content: string;
		createdAt: string;
	};
}

export default function SenderList({
	onActiveUserChange,
}: {
	onActiveUserChange: React.Dispatch<React.SetStateAction<ISenderList | null>>;
}) {
	const [filteredSenders, setFilteredSenders] = useState<ISenderList[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const receiverId = searchParams.get("receiverId") as string;

	const params = new URLSearchParams(searchParams.toString());

	const { data: senderListData, isLoading: isSenderListDataLoading } = trpc.chat.getMessageSenders.useQuery();

	const { data: userDetails } = trpc.user.getUserById.useQuery(
		{ userId: receiverId },
		{
			enabled: !!receiverId,
			onError: (error) => {
				toast.error("User not found");
				params.delete("receiverId");
				router.replace(`${pathname}?${params.toString()}`);
			},
		},
	);

	// Add socket effect for real-time updates
	useEffect(() => {
		const handleMessage = (message: any) => {
			setFilteredSenders((prevSenders) => {
				const senderIndex = prevSenders.findIndex((sender) => sender.senderId === message.senderId);

				const updatedMessage = {
					id: message.id,
					content: message.content,
					createdAt: message.createdAt,
				};

				if (senderIndex !== -1) {
					// Update existing sender's last message
					const updatedSenders = [...prevSenders];
					updatedSenders[senderIndex] = {
						...updatedSenders[senderIndex],
						lastMessage: updatedMessage,
					};
					return updatedSenders;
				} else if (message.senderDetails) {
					// Add new sender to the list
					const newSender: ISenderList = {
						senderId: message.senderId,
						senderDetails: message.senderDetails,
						lastMessage: updatedMessage,
					};
					return [newSender, ...prevSenders];
				}
				return prevSenders;
			});
		};

		socket.on("message", handleMessage);
		return () => {
			socket.off("message", handleMessage);
		};
	}, []);

	useEffect(() => {
		// Always set all senders first
		const allSenders = senderListData?.data || [];

		if (searchTerm.trim() === "") {
			setFilteredSenders(allSenders as any);
		} else {
			const searchFiltered = allSenders.filter((sender) => {
				const fullName = `${sender.senderDetails?.firstName} ${sender.senderDetails?.lastName}`.toLowerCase();
				return fullName.includes(searchTerm.toLowerCase());
			});
			setFilteredSenders(searchFiltered as any);
		}
	}, [searchTerm, senderListData?.data]);

	useEffect(() => {
		if (!receiverId) {
			onActiveUserChange(null);
			return;
		}

		const activeUser = filteredSenders.find((sender) => sender.senderId === receiverId);
		if (activeUser) {
			// Existing chat
			onActiveUserChange(activeUser);
		} else if (!filteredSenders.some((sender) => sender.senderId === receiverId)) {
			// Only create new chat if user doesn't exist in filtered senders
			if (!userDetails) return;

			const newChat: ISenderList = {
				senderId: receiverId,
				senderDetails: {
					id: userDetails.id,
					username: userDetails.username,
					firstName: userDetails.firstName,
					lastName: userDetails.lastName,
					email: userDetails.email,
					mobileNumber: userDetails.mobileNumber,
					avatarUrl: userDetails.avatarUrl,
					createdAt: userDetails.createdAt,
					updatedAt: userDetails.updatedAt,
					accountStatus: userDetails.accountStatus,
					role: userDetails.role,
				},
				lastMessage: {
					id: "",
					content: "",
					createdAt: new Date().toISOString(),
				},
			};
			onActiveUserChange(newChat);
			setFilteredSenders((prev) => [...prev, newChat]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [receiverId, filteredSenders, userDetails]);

	const handleSenderClick = (val: string) => {
		params.set("receiverId", val);
		router.push(`${pathname}?${params.toString()}`);
		const activeUser = filteredSenders.find((sender) => sender.senderId === val);
		onActiveUserChange(activeUser || null);
	};

	return (
		<aside
			className={`w-full md:w-1/3 border h-[75vh] border-[#D2D2D2] rounded-[15px] overflow-y-auto ${receiverId ? "hidden md:block" : ""}`}
		>
			<div className="p-4 ">
				<div className="relative">
					<Input
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search"
						className="pl-10 rounded-[10px] border-[#D9D9D9] border-solid focus:outline-none focus:border-[#C3996B] px-4 py-2.5 placeholder:text-[14px] text-[#6F6F6F] h-[39px]"
					/>
					<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#828282]" size={20} />
				</div>
			</div>

			{!isSenderListDataLoading ? (
				filteredSenders.length > 0 ? (
					filteredSenders.map((item, idx) => (
						<div
							key={idx}
							className={`flex items-start border-b-[1px] p-4 m-4 mt-0 cursor-pointer ${item.senderId === receiverId ? "bg-slate-100 px-2 rounded-md " : "bg-white"}`}
							onClick={() => handleSenderClick(item.senderId)}
						>
							<Avatar className="w-12 h-12 flex-shrink-0 bg-gray-300">
								<AvatarImage
									src={
										item.senderDetails?.role === "BUYER"
											? item.senderDetails.avatarUrl || ""
											: item.senderDetails?.vendor?.govermentPhotoIdUrls[2] || ""
									}
									alt="User Avatar"
								/>
								<AvatarFallback>
									{item.senderDetails.firstName?.charAt(0).toUpperCase() ||
										item.senderDetails.email?.charAt(0).toUpperCase() ||
										"U"}
								</AvatarFallback>
							</Avatar>
							<div className="ml-4 flex-1 min-w-0">
								<div className="flex justify-between items-baseline">
									<h3 className="font-medium text-[#292D32] text-[16px] truncate">
										{item.senderDetails.firstName
											? `${item.senderDetails.firstName} ${item.senderDetails.lastName}`
											: item.senderDetails.email}
									</h3>
									<p className="text-[14px] text-[#BDBDBD]">
										{formatRelativeTime(item.lastMessage.createdAt ?? "")}
									</p>
								</div>
								<p className="text-[14px] mt-1 text-[#383838] break-words line-clamp-2">
									{formatMessageContent(item.lastMessage.content)}
								</p>
							</div>
						</div>
					))
				) : (
					<div className="text-center text-sm text-muted-foreground">No sender found</div>
				)
			) : (
				<div className="flex justify-center items-center h-full">
					<Loader className="animate-spin" size={24} />
				</div>
			)}
		</aside>
	);
}
