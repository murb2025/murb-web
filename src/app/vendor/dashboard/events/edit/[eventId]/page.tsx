"use client";
import { trpc } from "@/app/provider";
import PublishEvent from "@/components/event/PublishEvent";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { IEvent } from "@/types/event.type";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IoIosArrowBack } from "react-icons/io";
import ProgressBar from "@/components/event/ProgressBar";
import SlotBookingTab from "@/components/event/Tab2/SlotBookingTab";
import BookingTab from "@/components/event/Tab3";
import GeneralInfoTabType1 from "@/components/event/Tab1/GeneralInfoTabType1";
import { useRouter } from "next/navigation";
import { eventSpecificTypeEnum } from "@/constants/event.constant";

import GeneralInfoTabVenue from "@/components/event/Tab1/GeneralInfoTabVenue";
const EventEdit = ({ params }: { params: { eventId: string } }) => {
	const { data: session } = useSession();
	const [currentPage, setCurrentPage] = useState(0);
	const [pageType, setPageType] = useState<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">("LISTING");
	const router = useRouter();
	const [event, setEvent] = useState<IEvent | null>(null);
	const { isLoading: isEventLoading } = trpc.event.getEventById.useQuery(
		{
			eventId: params.eventId,
		},
		{
			enabled: !!params.eventId,
			onSuccess: (data) => {
				setEvent(data?.event as unknown as IEvent);
			},
		},
	);

	useEffect(() => {
		if (session?.user.role === "BUYER") {
			notFound();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	// console.log(pageType);
	const updateEvent = (newEventData: Partial<IEvent>) => {
		setEvent((prevEvent) => ({ ...prevEvent, ...(newEventData as IEvent) }));
	};

	if (isEventLoading) {
		return (
			<div className="min-h-screen grid place-content-center">
				<Loader className="animate-spin" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen grid place-content-center">
				<h1>Event not found</h1>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full">
			<Button
				variant="ghost"
				className="hover:bg-transparent font-regular align-left w-fit mx-4 md:ml-40 hover:scale-95 transition-all ease duration-300"
				onClick={() => {
					if (pageType === "CATEGORIES") {
						router.back();
						return;
					} else if (pageType === "SPORTS") {
						setPageType("CATEGORIES");
						return;
					} else if (pageType === "LISTING") {
						if (currentPage === 3) {
							setPageType("PUBLISH");
						} else if (currentPage === 0) {
							setPageType("SPORTS");
						} else {
							setCurrentPage((prev: any) => prev - 1);
						}
						return;
					} else if (pageType === "PUBLISH") {
						setPageType("LISTING");
						return;
					}
				}}
			>
				<IoIosArrowBack className="w-6 h-6 font-normal text-[#1F1F1F]" />
				<p className="text-lg font-normal">Back</p>
			</Button>
			{pageType === "LISTING" ? (
				<div className="min-h-screen  flex flex-col">
					<div className="bg-white p-4 flex flex-col ">
						<h1 className="text-lg font-medium text-center text-[#1F1F1F]">
							<p className="text-gray-500">
								Editing Sport Category
								<span className="font-bold text-xl"> {event.eventSpecificType}</span>
							</p>
							<p className="text-sm text-gray-500">
								Sport Type: <span className="font-bold text-base">{event.sportType}</span>
							</p>
							<p className="text-sm text-gray-500">
								Sport: <span className="font-bold text-base">{event.tags}</span>
							</p>
						</h1>
					</div>

					<ProgressBar currentPage={currentPage} />

					<main className=" p-4">
						{currentPage === 0 ? (
							event.eventSpecificType === "Venue" ? (
								<GeneralInfoTabVenue
									currentPage={currentPage}
									setCurrentPage={setCurrentPage}
									event={event}
									updateEvent={updateEvent}
								/>
							) : (
								<GeneralInfoTabType1
									title={event.eventSpecificType}
									event={event}
									updateEvent={updateEvent}
									currentPage={currentPage}
									setCurrentPage={setCurrentPage}
								/>
							)
						) : currentPage === 1 ? (
							<SlotBookingTab
								handlePageTransition={setCurrentPage}
								currentPage={currentPage}
								isMultipleDays={
									event.eventSpecificType === eventSpecificTypeEnum.TOURNAMENTS_COMPETITIONS
										? false
										: true
								}
								isHaveSlots={event.isHaveSlots}
								isTeamEvent={event.isTeamEvent}
								event={event}
								updateEvent={updateEvent}
							/>
						) : (
							<BookingTab setPageType={setPageType} updateEvent={updateEvent} event={event} />
						)}
					</main>
				</div>
			) : (
				<PublishEvent event={event} isEdit={true} />
			)}
		</div>
	);
};

export default EventEdit;
