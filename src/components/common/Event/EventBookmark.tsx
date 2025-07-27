import { trpc } from "@/app/provider";
import { Button } from "@/components/ui";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BiSolidBookmark } from "react-icons/bi";
import { PiBookmarkSimpleLight } from "react-icons/pi";

export default function EventBookmark({ eventId, bookmarkedValue }: { eventId: string; bookmarkedValue: boolean }) {
	const [isBookmarked, setIsBookmarked] = useState(bookmarkedValue || false);
	const { data: session } = useSession();

	// Add these new mutations
	const { mutate: bookmarkEvent } = trpc.bookmark.createBookmark.useMutation({
		onSuccess: () => {
			setIsBookmarked(true);
			toast.success("Event bookmarked!");
		},
		onError: (error) => {
			if (error.data?.httpStatus === 401) {
				toast.error("Please login to bookmark");
			} else {
				toast.error("Failed to bookmark event" + error.message);
			}
		},
	});

	const { mutate: removeBookmark } = trpc.bookmark.removeBookmark.useMutation({
		onSuccess: () => {
			setIsBookmarked(false);
			toast.success("Bookmark removed!");
		},
		onError: (error) => {
			if (error.data?.httpStatus === 401) {
				toast.error("Please login to remove bookmark");
			} else {
				toast.error("Failed to remove bookmark" + error.message);
			}
		},
	});

	// Replace the existing bookmark button click handler
	const handleBookmarkClick = () => {
		if (!session?.user.id) {
			toast.error("Please login to bookmark");
			return;
		}
		if (isBookmarked) {
			removeBookmark({ eventId });
		} else {
			bookmarkEvent({ eventId });
		}
	};

	return (
		<Button
			className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md border border-[#C3996B] hover:bg-gray-50 transition-colors"
			aria-label="Bookmark event"
			onClick={(e) => {
				e.stopPropagation();
				handleBookmarkClick();
			}}
		>
			{isBookmarked ? (
				<BiSolidBookmark className="w-6 h-6 text-[#C4A484]" />
			) : (
				<PiBookmarkSimpleLight className="w-6 h-6 text-[#C4A484]" />
			)}
		</Button>
	);
}
