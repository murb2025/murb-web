"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IMessage } from "@/types/message.type";
import Image from "next/image";
import { trpc } from "@/app/provider";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { socket } from "@/server/socket";
import { ISenderList } from "./SenderList";
import TextareaAutosize from "react-textarea-autosize";

const formatMessageTime = (timestamp: string) => {
	const date = new Date(timestamp);
	return date
		.toLocaleString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.toUpperCase(); // This will return format like "5:01 PM"
};

export const formatMessageContent = (content: string) => {
	// URL regex pattern
	const urlPattern = /(https?:\/\/[^\s]+)/g;

	// Split the content by URLs
	const parts = content.split(urlPattern);

	// Find all URLs in the content
	const urls = content.match(urlPattern) || [];

	// Combine parts and URLs
	return parts.map((part, index) => {
		// If this part matches our URL pattern, render it as a link
		if (urlPattern.test(part)) {
			try {
				const url = new URL(part);
				const eventName = url.searchParams.get("eventName");
				return (
					<a
						key={index}
						href={part}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:underline break-all"
						onClick={(e) => e.stopPropagation()}
					>
						<i>{eventName?.split("-").join(" ") || "View Event"}</i>
					</a>
				);
			} catch {
				return <span key={index}>{part}</span>;
			}
		}
		// Otherwise render as regular text
		return <span key={index}>{part}</span>;
	});
};
export default function MessageList({ activeUser }: { activeUser: ISenderList | null }) {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const router = useRouter();

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { data: session } = useSession();
	const userId = session?.user.id;

	const searchParams = useSearchParams();
	const receiverId = searchParams.get("receiverId") as string;
	const eventIdStr = searchParams.get("eventId") as string;
	const eventName = searchParams.get("eventName") as string;

	const { data: userMessages, isLoading: isUserMessageLoading } = trpc.chat.getMessages.useQuery(
		{
			receiverId: receiverId,
		},
		{ enabled: !!receiverId },
	);

	const { mutateAsync: createMsg } = trpc.chat.createMessage.useMutation();
	// console.log(userMessages);

	useEffect(() => {
		if (userMessages?.success) {
			setMessages(userMessages?.data || []);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [receiverId, userMessages?.data]);

	useEffect(() => {
		if (eventIdStr) {
			const eventId = eventIdStr;
			setInputMessage(
				`I am interested in your event ${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}?eventName=${eventName}`,
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventIdStr]);

	useEffect(() => {
		if (session?.user?.id && receiverId) {
			// Join the chat room
			socket.emit("join", {
				userId: session.user.id,
				targetUserId: receiverId,
			});

			// Message handler
			const handleMessage = (message: IMessage) => {
				setMessages((prevMessages) => {
					// Check if message already exists to prevent duplicates
					const messageExists = prevMessages.some(
						(msg) =>
							msg.id === message.id ||
							(msg.content === message.content && msg.createdAt === message.createdAt),
					);
					if (messageExists) return prevMessages;
					return [...prevMessages, message];
				});
			};

			socket.on("message", handleMessage);

			// Clean up
			return () => {
				socket.off("message", handleMessage);
				socket.emit("leave", {
					userId: session.user.id,
					targetUserId: receiverId,
				});
			};
		}
	}, [session?.user?.id, receiverId]);

	const sendMessage = async (e: any) => {
		e.preventDefault();
		if (eventIdStr) {
			const url = new URL(window.location.href);
			url.searchParams.delete("eventId");
			url.searchParams.delete("eventName");
			window.history.replaceState({}, "", url.toString());
		}
		if (inputMessage.trim() && session?.user?.id) {
			const message = {
				content: inputMessage,
				senderId: session.user.id,
				receiverId: receiverId,
				createdAt: new Date().toISOString(), // Ensure consistent date format
			};

			setInputMessage("");

			try {
				// First save to database
				const savedMessage = await createMsg({
					content: message.content,
					receiverId: message.receiverId,
				});

				// Then emit through socket with the saved message ID
				socket.emit("message", {
					...message,
					id: savedMessage.data?.id, // Include the database ID if available
				});
			} catch (error: any) {
				toast.error("Failed to send message");
				console.error("Error sending message:", error);
			}
		}
	};

	// Scroll to bottom when messages change
	useEffect(() => {
		if (messagesEndRef.current) {
			const messageContainer = messagesEndRef.current.parentElement;
			if (messageContainer) {
				messageContainer.scrollTop = messageContainer.scrollHeight;
			}
		}
	}, [messages, receiverId]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			sendMessage(e);
			// Remove eventId from URL if present
			if (eventIdStr) {
				const url = new URL(window.location.href);
				url.searchParams.delete("eventId");
				window.history.replaceState({}, "", url.toString());
			}
		}
	};

	return (
		<main
			className={`flex-1 border border-[#D2D2D2] rounded-[15px] flex flex-col h-[75vh] overflow-y-auto ${receiverId ? "" : "hidden md:flex flex-col"}`}
		>
			{activeUser ? (
				<>
					<div className="p-4 flex items-center gap-2 shadow">
						<div className="flex items-center md:hidden">
							<ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => router.back()} />
						</div>
						<Avatar className="w-12 h-12 flex-shrink-0 bg-gray-300">
							<AvatarImage
								src={
									activeUser.senderDetails?.role === "BUYER"
										? activeUser.senderDetails.avatarUrl || ""
										: activeUser.senderDetails?.vendor?.govermentPhotoIdUrls[2] || ""
								}
								alt="User Avatar"
							/>
							<AvatarFallback>
								{activeUser.senderDetails.firstName?.charAt(0).toUpperCase() ||
									activeUser.senderDetails.email?.charAt(0).toUpperCase() ||
									"U"}
							</AvatarFallback>
						</Avatar>
						<h2 className="ml-2 font-medium text-lg">
							{activeUser.senderDetails.firstName
								? `${activeUser.senderDetails.firstName} ${
										activeUser?.senderDetails.lastName != null
											? activeUser?.senderDetails.lastName
											: ""
									}`
								: activeUser.senderDetails.email}
						</h2>
					</div>

					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{isUserMessageLoading ? (
							<div className="flex h-[75vh] justify-center items-center">
								<Loader className="animate-spin" />
							</div>
						) : (
							<div className="flex-grow overflow-y-auto p-4 pr-0 pl-0 h-[55vh]">
								{messages?.map((message, index) => (
									<div
										key={message.id || index}
										className={`p-2 px-4 pr-[64px] rounded-[15px] w-fit mb-2 relative ${
											message.senderId === userId
												? "bg-[#B8864E] ml-auto text-white text-left"
												: "bg-[#F6F6F6]"
										}`}
										style={{ maxWidth: "80%" }}
									>
										<div className="mb-[-2px] break-words md:break-all">
											{formatMessageContent(message.content)}
										</div>
										<div
											className={`absolute bottom-1 right-3 text-[10px] ${
												message.senderId === userId ? "text-white/70" : "text-black/50"
											}`}
										>
											{formatMessageTime(message.createdAt?.toString() ?? "")}
										</div>
									</div>
								))}
								<div ref={messagesEndRef} />
							</div>
						)}
					</div>

					<div className="p-4">
						<form onSubmit={sendMessage} className="relative flex justify-center items-center w-full gap-2">
							<TextareaAutosize
								className="w-full min-h-[40px] max-h-[200px] text-slate-600 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none overflow-y-auto"
								name="message"
								id="message"
								value={inputMessage}
								onChange={(e) => {
									setInputMessage(e.target.value);
								}}
								onKeyDown={(e) => {
									handleKeyPress(e);
								}}
								placeholder="Message here..."
								required
								minRows={1}
								maxRows={4}
							/>
							<Button
								size="sm"
								type="submit"
								// disabled={
								//     isLoading || !inputMessage.trim()
								// }
								className="hover:scale-110 transition-all ease-in-out duration-300 rounded-full p-1 bg-inherit hover:bg-inherit"
							>
								<Image
									src="/images/Send.svg"
									alt="submit"
									width={34}
									height={34}
									className="shadow-lg rounded-full"
								/>
							</Button>
						</form>
					</div>
				</>
			) : (
				<div className="flex items-center justify-center h-full text-gray-500">
					Select a conversation to start chatting
				</div>
			)}
		</main>
	);
}
