"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import CreateAccount from "@/components/Popups/CreateAccount";
import { useStore } from "@/hooks";
import toast from "react-hot-toast";
import { notFound, useRouter } from "next/navigation";
import ThankYou from "@/components/Popups/ThankYou";
import { useSession } from "next-auth/react";
import { trpc } from "@/app/provider";
import EventFullDetails from "@/components/common/Event/EventFullDetail";
import { Link, Loader2 } from "lucide-react";
import {
	AlertDialogFooter,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogTrigger,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { vendorTermsAndConditions } from "@/constants/booking.constant";
import { IEvent } from "@/types/event.type";
import { resetEvent } from "@/context/slices/event.slice";
import { Checkbox } from "@/components/ui/checkbox";
interface IPublishEvent {
	event: IEvent;
	isEdit?: boolean;
}

const PublishEvent = ({ event, isEdit }: IPublishEvent) => {
	const { data: session } = useSession();

	const user = session?.user;

	const [showPopup, setShowPopup] = useState(false);
	const [isTermsAccepted, setIsTermsAccepted] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
	const [pendingVerification, setPendingVerification] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	// const [isProfileFilled, setIsProfileFilled] = useState(false);
	const router = useRouter();
	const { dispatch } = useStore();
	const { mutateAsync: createEventMutation } = trpc.event.createEvent.useMutation();
	const { mutateAsync: updateEventMutation } = trpc.event.updateEvent.useMutation();
	// trpc.user.checkProfileField.useQuery(undefined, {
	// 	onSuccess: (data) => {
	// 		setIsProfileFilled(data.isFilled);
	// 	},
	// });

	const handleSkipPublish = async () => {
		dispatch(resetEvent());
		router.push("/vendor/dashboard");
	};

	const handlePublish = async () => {
		// console.log(user);

		if (!user?.id) {
			setShowPopup(true);
			return;
		}

		// console.log(isProfileFilled);

		// if (!isProfileFilled) {
		// 	toast.success("Please complete your profile to publish an event");
		// 	router.push("/vendor/verification");
		// 	return;
		// }

		try {
			setIsLoading(true);

			await createEventMutation({
				eventSpecificType: event.eventSpecificType,
				sportType: event.sportType,
				tags: event.tags,
				vendorId: user?.id!,

				// General info
				title: event.title !== "" ? event.title : `Venue-${event.tags}`,
				host: event.host,
				description: event.description,

				isOnline: event.isOnline,
				isHomeService: event.isHomeService,
				location: event.location,
				landmark: event.landmark,
				city: event.city,
				state: event.state,
				country: event.country,
				pincode: event.pincode,

				eventType: event.eventType,
				amenities: event.amenities,

				// schedule info
				isMonthlySubscription: event.isMonthlySubscription,
				numberOfDays: event.numberOfDays,
				multipleDays: event.multipleDays,
				startDate: event.startDate,
				endDate: event.endDate,
				weekDays: event.weekDays,

				startingTime: event.startingTime,
				endingTime: event.endingTime,

				isHaveSlots: event.isHaveSlots,
				slotDuration: event.slotDuration,
				slots: event.slots || [],
				isTeamEvent: event.isTeamEvent,
				teamSize: event.teamSize || 0,
				maximumParticipants: event.maximumParticipants,
				bookingChart: event.bookingChart,

				// booking info
				bookingDetails: event.bookingDetails,
				images: event?.images,
				termsAndConditions: event.termsAndConditions,

				// admin info
				language: "English",
				visibility: "PUBLIC",
			});

			dispatch(resetEvent());
			toast.success("Event sent for verification.");
			router.push("/vendor/dashboard");
		} catch (error) {
			console.error("Error publishing event:", error);
			toast.error("Failed to publish event");
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdate = async () => {
		if (!user?.id) {
			setShowPopup(true);
			return;
		}

		try {
			setIsLoading(true);

			const updatedEvent = await updateEventMutation({
				eventId: event.id!,
				data: {
					eventSpecificType: event.eventSpecificType,
					sportType: event.sportType,
					tags: event.tags,
					vendorId: user?.id!,

					// General info
					title: event.title !== "" ? event.title : `Venue-${event.tags}`,
					host: event.host,
					description: event.description,

					isOnline: event.isOnline,
					isHomeService: event.isHomeService,
					location: event.location,
					landmark: event.landmark,
					city: event.city,
					state: event.state,
					country: event.country,
					pincode: event.pincode,

					eventType: event.eventType,
					amenities: event.amenities,

					// schedule info
					isMonthlySubscription: event.isMonthlySubscription,
					numberOfDays: event.numberOfDays || 1,
					multipleDays: event.multipleDays,
					startDate: event.startDate,
					endDate: event.endDate,
					weekDays: event.weekDays,

					startingTime: event.startingTime,
					endingTime: event.endingTime,

					isHaveSlots: event.isHaveSlots,
					slotDuration: event.slotDuration,
					slots: event.slots || [],
					isTeamEvent: event.isTeamEvent,
					teamSize: event.teamSize || 0,
					maximumParticipants: event.maximumParticipants,
					bookingChart: event.bookingChart.map((chart) => ({
						id: chart.id!,
						date: chart.date,
						bookedSeats: chart.bookedSeats,
						slot: chart.slot,
					})),

					// booking info
					bookingDetails: event.bookingDetails.map((detail) => ({
						id: detail.id,
						type: detail.type,
						amount: detail.amount,
						currency: detail.currency,
						currencyIcon: detail.currencyIcon,
						description: detail.description || "",
						months: detail.months || undefined,
						title: detail.title || "",
						membersCount: detail.membersCount,
					})),
					images: event?.images,
					termsAndConditions: event.termsAndConditions,

					// admin info
					language: "English",
					status: event.status || "PENDING",
					visibility: "PUBLIC",
				},
			});

			// dispatch(resetEvent());
			toast.success("Event Updated Successfully.");
			router.push(`/event/detail/${updatedEvent.data.eventId}`);
		} catch (error) {
			console.error("Error updating event:", error);
			toast.error("Failed to update event");
		} finally {
			setIsLoading(false);
		}
	};

	const description = event?.description || "";
	const DESCRIPTION_THRESHOLD = 150;
	const shouldTruncate = description.length > DESCRIPTION_THRESHOLD;

	const renderDescription = () => {
		if (!shouldTruncate) return description;

		return isDescriptionExpanded ? description : `${description.slice(0, DESCRIPTION_THRESHOLD)}...`;
	};

	useEffect(() => {
		if (session?.user.role === "BUYER") {
			toast.error("You don't have permission to create event.");
			router.push("/");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	return (
		<>
			{showPopup && <CreateAccount setOpen={setShowPopup} open={showPopup} />}

			{pendingVerification && <ThankYou handleCLose={setPendingVerification} inprogress={true} />}

			{showSuccess && <ThankYou handleCLose={setShowSuccess} />}

			<div className="pb-4 sm:pb-8">
				<div className="w-full px-4 sm:px-10 bg-background">
					<div className="p-0 space-y-4 w-full">
						<h1 className="text-lg sm:text-3xl font-regular">Need to make some changes?</h1>

						<EventFullDetails data={event} />

						{/* accept terms and conditions with checkbox */}
						<AlertDialog>
							<div className="flex gap-2 md:justify-center">
								<div
									className="flex items-center gap-2 font-medium cursor-pointer"
									onClick={() => setIsTermsAccepted(!isTermsAccepted)}
								>
									<Checkbox checked={isTermsAccepted} />
									By publishing this event, you agree to the{" "}
								</div>
								<AlertDialogTrigger asChild>
									<div className="text-blue-500 underline cursor-pointer">Terms and Conditions</div>
								</AlertDialogTrigger>
							</div>
							<AlertDialogContent className="md:min-w-[800px]">
								<AlertDialogHeader>
									<AlertDialogTitle className="text-xl">Terms and Conditions</AlertDialogTitle>
									<AlertDialogDescription className="px-4 py-2 max-h-[75vh] overflow-y-auto">
										<h1 className="title text-lg">Host Agreement</h1>
										<ol className="sub-title text-left list-decimal px-6 overflow-y-auto">
											{vendorTermsAndConditions.map((text, idx) => (
												<li key={idx}>{text}</li>
											))}
										</ol>
									</AlertDialogDescription>
								</AlertDialogHeader>

								<AlertDialogFooter className="flex gap-4">
									<AlertDialogCancel>Close</AlertDialogCancel>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>

						<div className="w-full flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-4 sm:mt-8">
							{!isEdit && (
								<Button
									variant="outline"
									className="w-full sm:w-auto text-black text-[18px] sm:text-[22px] hover:bg-black/10 hover:scale-95 border-solid-1 border-black transition-all ease duration-300"
									onClick={handleSkipPublish}
								>
									Skip
								</Button>
							)}

							<Button
								className="w-full sm:w-[140px] text-[18px] sm:text-[22px] hover:bg-black/70 text-white bg-black hover:scale-95 hover:bg-black transition-all ease duration-300"
								onClick={isEdit ? handleUpdate : handlePublish}
								disabled={isLoading || !isTermsAccepted}
							>
								{isLoading ? (
									<span className="flex items-center gap-2">
										<Loader2 className="w-4 h-4 animate-spin" />
										{isEdit ? "Updating..." : "Publishing..."}
									</span>
								) : (
									<span className="flex items-center gap-2">{isEdit ? "Update" : "Publish"}</span>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PublishEvent;
