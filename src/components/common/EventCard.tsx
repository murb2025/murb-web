"use client";
import React, { useState } from "react";
import { Calendar, Clock, Globe, MapPin, MapPinHouse, Siren, Sunset, Users } from "lucide-react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import moment from "moment";
import EventBookmark from "./Event/EventBookmark";
import { IBookingDetail, IEvent } from "@/types/event.type";
import RateEvent from "./Event/RateEvent";
import FeaturedEvent from "./Event/FeaturedEvent";
import PromoteButton from "../Dashboard/Promotions/PromoteButton";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui";
import TrendingEventIcon from "./Event/TrendingEventIcon";
import { useSession } from "next-auth/react";
import EventDropDown from "./Event/EventDropDown";
import { sortDaysOfWeek } from "@/utils/events";

interface EventCardProps {
	eventId: string;
	title: string;
	date: string;
	time: string;
	location: string;
	price: IBookingDetail;
	seatsLeft: string;
	category?: string;
	booked?: boolean;
	type?: "BUYER" | "VENDOR" | "ADMIN" | "BANNER" | "BOOKING" | "PROMOTION" | "TRENDING";
	status?: string;
	cardRef?: React.RefObject<HTMLDivElement>;
	promotion?: boolean;
	images: string[];
	tags: string;
	bookingId?: string;
	tickets?: number;
	bookedAt?: Date;
	isBookmarkedValue: boolean;
	eventData: Partial<IEvent>;
}

const getEventStatus = (eventData: Partial<IEvent>) => {
	// console.log(eventData.title, eventData?.startDate, eventData?.endDate, eventData?.multipleDays);

	// Get today's date in YYYY-MM-DD format using Moment.js
	const todayDateStr = moment().format("YYYY-MM-DD");

	// Ensure event dates are in YYYY-MM-DD format
	const startDate = eventData?.startDate ? eventData.startDate.split("T")[0] : null;
	const endDate = eventData?.endDate ? eventData.endDate.split("T")[0] : null;

	// console.log("Computed Dates ->", { today: todayDateStr, startDate, endDate });

	if (eventData?.status === "PUBLISHED") {
		if (eventData?.multipleDays) {
			if (startDate && startDate > todayDateStr) {
				return "Upcoming";
			}
			if (startDate && endDate && startDate <= todayDateStr && endDate >= todayDateStr) {
				return "Live";
			}
			if (endDate && endDate < todayDateStr) {
				return "Ended";
			}
		} else {
			if (startDate && startDate > todayDateStr) {
				return "Upcoming";
			}
			if (startDate && startDate === todayDateStr) {
				return "Live";
			}
			if (startDate && startDate < todayDateStr) {
				return "Ended";
			}
		}
	}
	return eventData?.status;
};

export const formatTime = (timeString: string | undefined) => {
	if (timeString === "00:00 - 24:00") {
		return "Open 24 hours";
	}
	if (!timeString || typeof timeString !== "string") return "TBD";

	// If time contains a hyphen, it's a time range
	if (timeString.includes("-")) {
		const [start, end] = timeString.split("-").map((t) => t.trim());

		try {
			const startDate = new Date(start);
			const endDate = new Date(end);

			// Check if dates are valid
			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				return timeString; // Return original string if dates are invalid
			}

			return `${startDate.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})} - ${endDate.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})}`;
		} catch (error) {
			return timeString; // Return original string if parsing fails
		}
	}

	// Single time
	try {
		const date = new Date(timeString);

		// Check if date is valid
		if (isNaN(date.getTime())) {
			return timeString; // Return original string if date is invalid
		}

		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	} catch (error) {
		return timeString; // Return original string if parsing fails
	}
};

const PriceSection = (priceDetail: IBookingDetail) => {
	return (
		<p className="text-lg sm:text-xl space-x-1 font-bold text-[#C3996B]">
			<span>
				{priceDetail?.currencyIcon + " " + new Intl.NumberFormat("en-IN").format(priceDetail?.amount || 0)}
			</span>
			<span className="text-sm font-normal">
				{priceDetail?.membersCount > 1 ? priceDetail?.membersCount + " person" : ""}
			</span>
		</p>
	);
};

const EventCard: React.FC<EventCardProps> = ({
	eventId,
	title,
	date,
	time,
	location,
	price,
	seatsLeft,
	booked = false,
	type = "BUYER",
	status,
	cardRef,
	promotion = false,
	images,
	tags,
	bookingId,
	tickets,
	bookedAt,
	isBookmarkedValue,
	eventData,
}) => {
	const [eventStatus, setEventStatus] = useState(status || "");

	const [isBookmarked, setIsBookmarked] = useState(isBookmarkedValue || false);
	const router = useRouter();

	const queryClient = useQueryClient();

	const { mutateAsync: publishEvent } = trpc.admin.publish.useMutation();

	const formattedTime = formatTime(time);

	return (
		<div
			ref={cardRef}
			className={`bg-white h-full flex flex-col rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-[#AEAEAE]/56 w-full max-w-full`}
		>
			<div
				className="relative cursor-pointer"
				onClick={() => {
					router.push("/event/detail/" + eventId);
				}}
			>
				<Image
					src={images[0] || "/images/card.svg"}
					alt={title}
					width={312}
					height={188}
					className="w-full h-[12rem]- aspect-video  object-cover"
				/>
				<div className="absolute top-3 sm:top-4 right-3 sm:right-4">
					<span className="bg-white text-indigo-600 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
						{tags}
					</span>
				</div>
				{type === "PROMOTION" && eventData?.featured ? (
					<div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white rounded-full px-2 py-1 shadow-md border border-[#C3996B]">
						<p className="text-[#C4A484] font-normal text-xs">Featured</p>
					</div>
				) : null}

				{type === "BANNER" ? (
					<FeaturedEvent eventId={eventId} featured={eventData?.featured ? true : false} />
				) : type === "TRENDING" ? (
					<TrendingEventIcon eventId={eventId} trending={eventData?.trending ? true : false} />
				) : (
					<EventBookmark eventId={eventId} bookmarkedValue={isBookmarked} />
				)}
				{(type === "VENDOR" || type === "ADMIN") && (
					<div onClick={(e) => e.stopPropagation()} className="absolute top-3 sm:top-4 left-3 sm:left-4">
						<EventDropDown eventId={eventId} />
					</div>
				)}
			</div>

			<div
				className="px-4 sm:px-6 py-2 relative flex-1 flex flex-col cursor-pointer"
				onClick={() => router.push(`/event/detail/${eventId}`)}
			>
				<div className="flex justify-between items-center gap-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<h1 className="text-left text-balance capitalize text-xl md:text-2xl font-bold leading-tight mb-1 line-clamp-2">
									{title}
								</h1>
							</TooltipTrigger>
							<TooltipContent>
								<p>{title}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{type === "ADMIN" ? (
						<Popover>
							<PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
								<div
									className={`${
										status === "PUBLISHED"
											? getEventStatus({ ...eventData, status: eventStatus }) === "Ended"
												? "bg-red-100"
												: "bg-[#CAFDD3]"
											: "bg-gray-300"
									} text-black px-3 whitespace-nowrap flex-shrink-0 py-1 rounded-full text-sm font-medium`}
								>
									{getEventStatus({ ...eventData, status: eventStatus })}
								</div>
							</PopoverTrigger>
							<PopoverContent>
								<p>Update Status</p>
								<div className="grid gap-1">
									{["PUBLISHED", "PENDING", "UNPUBLISHED"].map((str, idx) => (
										<p
											key={idx}
											onClick={async (e) => {
												e.stopPropagation();
												// if (str === status) {
												// 	toast.error("Event is already " + str);
												// 	return;
												// }
												try {
													await publishEvent({
														eventId: String(eventId),
														status: str as any,
													});
													toast.success("Event " + str);
													setEventStatus(str);
													queryClient.invalidateQueries({ queryKey: ["events"] });
												} catch (error: any) {
													// console.log(error.message);
													toast.error(error.message || "Something went wrong");
												}
											}}
											className={`border px-4 py-1 rounded-md shadow-sm hover:bg-slate-400 cursor-pointer ${
												eventStatus === str
													? str === "PUBLISHED"
														? "bg-green-400"
														: "bg-yellow-400"
													: "bg-slate-100"
											}`}
										>
											{str}
										</p>
									))}
								</div>
							</PopoverContent>
						</Popover>
					) : (
						<div
							className={`flex-shrink-0 ${
								status === "PUBLISHED"
									? getEventStatus(eventData!) === "Ended"
										? "bg-red-100"
										: "bg-[#CAFDD3]"
									: "bg-gray-300"
							} text-black px-3 whitespace-nowrap py-1 rounded-full text-xs sm:text-sm font-medium`}
						>
							{getEventStatus(eventData!)}
						</div>
					)}
				</div>
				<div className="space-y-1 sm:space-y-2.5 text-gray-600">
					<div className="flex items-center gap-2.5">
						<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#CE8330]" />
						<span className="text-xs sm:text-sm font-medium text-black">
							{eventData?.weekDays?.length ? sortDaysOfWeek(eventData?.weekDays).join(", ") : date}
						</span>
					</div>
					{/* Remove date slots */}
					{/* <div className="flex items-center gap-3">
						<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#CE8330]" />
						<span className="text-xs sm:text-sm font-medium text-black">
							{eventData?.isHaveSlots ? "Multiple slots available" : formattedTime}
						</span>
					</div> */}
					<div className="flex items-center gap-3">
						{eventData?.isOnline ? (
							<Globe className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#CE8330]" />
						) : eventData?.isHomeService ? (
							<MapPinHouse className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#CE8330]" />
						) : (
							<MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#CE8330]" />
						)}
						<span className="text-xs sm:text-sm font-medium capitalize text-black">{location}</span>
					</div>
					{eventData?.minimumParticipants && (
						<div className="flex items-center gap-3">
							<Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#CE8330]" />
							<span className="text-xs sm:text-sm font-medium text-black">
								Min. Participants: {eventData.minimumParticipants}
							</span>
						</div>
					)}
				</div>
			</div>
			{!booked && (
				<div className="flex px-4 sm:px-6 py-2 pb-4 flex-col justify-between border-t border-gray-100">
					{type === "BUYER" ? (
						<>
							<div className="flex items-center gap-2">
								<Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#CE8330]" />
								<span className="text-xs sm:text-sm font-medium text-black">{seatsLeft}</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								{PriceSection(price)}
								<Button
									onClick={() => router.push("/event/detail/" + eventId)}
									variant="custom"
									className="text-sm sm:text-base font-medium"
								>
									Book Now
								</Button>
							</div>
						</>
					) : type === "BOOKING" ? (
						<>
							<div
								className={`flex ${status === "SUCCESS" ? "flex-row justify-between items-center" : "flex-col justify-start justify-items-start items-start"} mb-2 items-center gap-2`}
							>
								<div className="flex items-center gap-2">
									<Users className="w-5 h-5 text-[#CE8330]" />
									<span className="text-[11px] sm:text-[12px] font-medium text-black">
										{tickets?.toString()} tickets
									</span>
								</div>
								<span className="text-xs sm:text-sm font-medium text-black">
									{status === "SUCCESS" ? "Booked on " : "Unsuccessful on "}{" "}
									{moment(bookedAt).format("DD MMM YYYY hh:mm a")}
								</span>
							</div>
							{status === "SUCCESS" && (
								<div className="flex items-center justify-between gap-4">
									<section className="text-xl font-bold text-[#C3996B]">
										{eventData?.bookedSlot?.date && (
											<>
												{moment(eventData.bookedSlot.date).isBefore(moment(), "day") ? (
													<RateEvent
														eventId={eventData?.id!}
														existingRating={eventData?.reviews && eventData?.reviews[0]}
													/>
												) : moment(eventData.bookedSlot.date).isSame(moment(), "day") ? (
													<div className="text-xs sm:text-sm text-gray-600 flex gap-1 items-center justify-center">
														<Siren className="h-4 w-4" />
														<span>Event is today!</span>
													</div>
												) : (
													<span className="text-xs sm:text-sm text-gray-600">
														{moment(eventData.bookedSlot.date)
															.startOf("day")
															.diff(moment().startOf("day"), "days")}{" "}
														days left
													</span>
												)}
											</>
										)}
									</section>
									<Button
										onClick={(e) => {
											e.stopPropagation();
											router.push("/buyer/bookings/ticket/" + bookingId);
										}}
										variant="custom"
										className="px-4 sm:px-6 py-2 text-sm sm:text-base font-medium"
									>
										View Ticket
									</Button>
								</div>
							)}
						</>
					) : type === "PROMOTION" ? (
						<>
							<div className="flex items-center gap-2">
								<Users className="w-5 h-5 text-[#CE8330]" />
								<span className="text-[11px] sm:text-[12px] font-medium text-black">{seatsLeft}</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								{PriceSection(price)}
								<PromoteButton event={(eventData as any) || []} />
							</div>
						</>
					) : (
						<div className="flex flex-row items-center justify-between">
							{PriceSection(price)}
							<div className="flex items-center gap-2">
								<Users className="w-5 h-5 text-[#CE8330]" />
								<span className="text-[12px] font-medium text-black">{seatsLeft}</span>
							</div>
						</div>
					)}
				</div>
			)}

			{promotion && (
				<div className="flex w-fulll justify-end">
					{" "}
					<Button variant="custom" className="mt-4 text-[11px] sm:text-[12px] font-medium">
						Promote
					</Button>
				</div>
			)}
		</div>
	);
};

export default EventCard;
