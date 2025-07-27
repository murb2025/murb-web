import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/app/provider";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { IEvent } from "@/types/event.type";
import { Badge } from "@/components/ui/badge";

interface EventReviewsProps {
	data: Partial<IEvent>;
}

export default function EventReviews({ data }: EventReviewsProps) {
	const { data: session } = useSession();
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [showReviewForm, setShowReviewForm] = useState(false);

	const reviews = Array.isArray(data.reviews) ? data.reviews : [];
	const averageRating =
		reviews.length > 0
			? reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / reviews.length
			: 0;

	const { mutateAsync: createReview } = trpc.event.createReview.useMutation();
	const { refetch: refetchEvent } = trpc.event.getEventById.useQuery(
		{
			eventId: data.id as string,
		},
		{
			enabled: !!data.id,
		},
	);

	const handleSubmitReview = async () => {
		if (!session) {
			toast.error("Please login to submit a review");
			return;
		}

		if (rating === 0) {
			toast.error("Please select a rating");
			return;
		}

		try {
			await createReview({
				eventId: data.id as string,
				rating,
				comment,
			});

			toast.success("Review submitted successfully");
			setRating(0);
			setComment("");
			setShowReviewForm(false);
			refetchEvent();
		} catch (error) {
			toast.error("Failed to submit review");
		}
	};

	if (data.reviews?.length === 0) {
		return null;
	}

	return (
		<div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
				<div className="mb-4 sm:mb-0 w-full">
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Reviews</h2>
					{reviews.length > 0 && (
						<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
							<div className="flex">
								{[1, 2, 3, 4, 5].map((star) => (
									<StarFilledIcon
										key={star}
										className={`w-5 sm:w-6 h-5 sm:h-6 ${
											star <= averageRating ? "text-yellow-500" : "text-gray-300"
										}`}
									/>
								))}
							</div>
							<span className="text-lg sm:text-xl font-semibold text-gray-700">
								{averageRating.toFixed(1)}{" "}
								<span className="text-gray-500 text-base">({reviews.length} reviews)</span>
							</span>
						</div>
					)}
				</div>
				{session && showReviewForm && (
					<Button
						onClick={() => setShowReviewForm(true)}
						className="w-full sm:w-auto mt-3 sm:mt-0 bg-primary hover:bg-primary-700 transition-colors duration-300"
					>
						Write a Review
					</Button>
				)}
			</div>

			{/* Review Form */}
			{showReviewForm && (
				<Card className="w-full bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
					<h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Share Your Experience</h3>
					<div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
						{[1, 2, 3, 4, 5].map((star) => (
							<StarIcon
								key={star}
								className={`w-6 sm:w-7 h-6 sm:h-7 cursor-pointer transition-colors duration-200 ${
									star <= rating
										? "text-yellow-500 fill-current"
										: "text-gray-300 hover:text-yellow-300"
								}`}
								onClick={() => setRating(star)}
							/>
						))}
					</div>
					<Textarea
						placeholder="Tell us about your experience with this event..."
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						className="w-full mb-4 sm:mb-5 min-h-[100px] sm:min-h-[120px] border-gray-300 focus:border-primary focus:ring focus:ring-primary/30"
					/>
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
						<Button
							onClick={handleSubmitReview}
							className="w-full sm:w-auto bg-primary hover:bg-primary-700 transition-colors duration-300"
						>
							Submit Review
						</Button>
						<Button
							variant="outline"
							onClick={() => setShowReviewForm(false)}
							className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</Button>
					</div>
				</Card>
			)}

			{/* Reviews List */}
			<div className="space-y-4 sm:space-y-6">
				{reviews.map((review, index: number) => (
					<Card
						key={index}
						className="w-full bg-white shadow-md rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
					>
						<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
							<Avatar className="w-10 sm:w-12 h-10 sm:h-12 self-start border-2 border-gray-200">
								<AvatarImage src={review?.users?.avatarUrl || ""} className="object-cover" />
								<AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
									{review?.users?.firstName?.[0]}
									{review?.users?.lastName?.[0]}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 w-full">
								<div className="flex flex-col sm:flex-row justify-between items-start mb-2">
									<div className="w-full">
										<section className="flex flex-row sm:items-center gap-1 sm:gap-3 mb-1">
											{review?.users?.firstName && (
												<p className="font-bold text-gray-900 text-sm sm:text-base">
													{review?.users?.firstName} {review?.users?.lastName}
												</p>
											)}
											<Badge variant={"outline"} className="text-xs sm:text-sm text-gray-500">
												{format(new Date(review?.updatedAt), "MMM d, yyyy")}
											</Badge>
										</section>
										<div className="flex gap-1 mt-1">
											{[1, 2, 3, 4, 5].map((star) => (
												<StarFilledIcon
													key={star}
													className={`w-4 sm:w-5 h-4 sm:h-5 ${
														star <= review?.rating ? "text-yellow-500" : "text-gray-300"
													}`}
												/>
											))}
										</div>
									</div>
								</div>
								{review?.comment && (
									<p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
										{review?.comment}
									</p>
								)}
								{review?.comments?.map((vendorComment, index: number) => (
									<div key={index} className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
										<section className="flex items-start gap-3 sm:gap-4">
											<Avatar className="w-8 sm:w-10 h-8 sm:h-10 border-2 border-gray-200">
												<AvatarImage
													src={vendorComment?.user?.avatarUrl || ""}
													className="object-cover"
												/>
												<AvatarFallback className="bg-primary/20 text-primary font-bold text-xs sm:text-sm">
													{vendorComment?.user?.firstName?.[0]}
													{vendorComment?.user?.lastName?.[0]}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1">
												<div className="flex flex-row justify-start items-center gap-2 mb-2">
													{vendorComment?.user?.firstName && (
														<p className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-0">
															{vendorComment?.user?.firstName}{" "}
															{vendorComment?.user?.lastName || ""}
														</p>
													)}
													<Badge
														variant={"outline"}
														className="text-xs sm:text-sm text-gray-500"
													>
														{format(new Date(vendorComment?.updatedAt), "MMM d, yyyy")}
													</Badge>
													<Badge
														variant={"outline"}
														className="text-xs bg-murbBg sm:text-sm text-white"
													>
														VENDOR
													</Badge>
												</div>
												{vendorComment?.content && (
													<p className="text-sm sm:text-base text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
														{vendorComment?.content}
													</p>
												)}
											</div>
										</section>
									</div>
								))}
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
