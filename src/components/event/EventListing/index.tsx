"use client";
import React from "react";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks";
import BookingTab from "@/components/event/Tab3";
import GeneralInfoTabType1 from "@/components/event/Tab1/GeneralInfoTabType1";
import SlotBookingTab from "@/components/event/Tab2/SlotBookingTab";
import { IEvent } from "@/types/event.type";

interface IVenueListing {
	setPageType: React.Dispatch<React.SetStateAction<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">>;
	currentPage: number;
	setCurrentPage: any;
}

export default function EventListing({ setPageType, currentPage, setCurrentPage }: IVenueListing) {
	const { event, setEvent, dispatch } = useStore();

	const updateEvent = (newEventData: Partial<IEvent>) => {
		dispatch(setEvent({ ...event, ...newEventData }));
	};

	return (
		<>
			<div className="min-h-screen  flex flex-col">
				<div className="bg-white p-4 flex flex-col ">
					<h1 className="text-2xl font-medium text-center">List Events & Experiences</h1>
				</div>

				<ProgressBar currentPage={currentPage} />

				<main className=" p-4">
					{currentPage === 0 ? (
						<GeneralInfoTabType1
							title="Events & Experiences"
							event={event}
							updateEvent={updateEvent}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					) : currentPage === 1 ? (
						<SlotBookingTab
							handlePageTransition={setCurrentPage}
							currentPage={currentPage}
							isMultipleDays={true}
							isHaveSlots={true}
							isTeamEvent={true}
							event={event}
							updateEvent={updateEvent}
						/>
					) : (
						<BookingTab setPageType={setPageType} updateEvent={updateEvent} event={event} />
					)}
				</main>
			</div>
		</>
	);
}
