import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader, Pen, StarIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import { IReview } from "@/types/event.type";

interface RateEventProps {
	showComment?: boolean;
	eventId: string;
	existingRating?: IReview;
}

export default function RateEvent({ eventId, existingRating, showComment }: RateEventProps) {
	const { data: session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [rating, setRating] = useState(existingRating?.rating || 0);
	const [comment, setComment] = useState(existingRating?.comment || "");
	const [displayRating, setDisplayRating] = useState(existingRating?.rating || 0);
	const [displayComment, setDisplayComment] = useState(existingRating?.comment || "");

	useEffect(() => {
		if (existingRating) {
			setRating(existingRating.rating);
			setComment(existingRating.comment);
			setDisplayRating(existingRating.rating);
			setDisplayComment(existingRating.comment);
		}
	}, [existingRating]);

	const utils = trpc.useContext();

	const { mutate: submitRating, isLoading } = trpc.feedback.rateEvent.useMutation({
		onSuccess: () => {
			toast.success(existingRating ? "Rating updated successfully!" : "Rating submitted successfully!");
			setDisplayRating(rating);
			setDisplayComment(comment);
			setIsOpen(false);
			utils.feedback.getFeedback.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to submit rating");
		},
	});

	const handleSubmitReview = () => {
		if (!session?.user?.id) {
			toast.error("Please login to rate the event");
			return;
		}

		submitRating({
			eventId,
			userId: session.user.id,
			rating,
			comment,
		});
	};

	if (existingRating && !isOpen) {
		return (
			<div className={`flex  gap-2  ${showComment ? "flex-col" : "items-center"}`}>
				<section className="flex gap-2">
					<div className="flex gap-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<StarIcon
								key={star}
								className={`w-4 h-4 ${
									displayRating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
								}`}
							/>
						))}
					</div>
					<button onClick={() => setIsOpen(true)} className="text-sm text-blue-600 hover:underline">
						<Pen className="h-4 w-4" />
					</button>
				</section>
				{showComment && <div className="break-words">{displayComment}</div>}
			</div>
		);
	}

	return (
		<div>
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(true);
				}}
				className="text-sm text-blue-600 hover:underline"
			>
				{existingRating ? "Edit Rating" : "Rate Event"}
			</button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{existingRating ? "Edit Review" : "Review Event"}</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((star) => (
								<StarIcon
									key={star}
									className={`w-6 h-6 cursor-pointer ${
										rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
									}`}
									onClick={() => setRating(star)}
								/>
							))}
						</div>
						<Textarea
							placeholder="Write your review here..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							rows={4}
						/>
						<Button variant={"outline"} onClick={handleSubmitReview} disabled={!rating || !comment}>
							{isLoading ? (
								<Loader className="animate-spin" />
							) : existingRating ? (
								"Update Review"
							) : (
								"Submit Review"
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
