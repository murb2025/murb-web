import React from "react";
import ProgressBar from "../ProgressBar";
import GeneralInfoTabVenue from "../Tab1/GeneralInfoTabVenue";
import { Button } from "@/components/ui/button";
import BookingTab from "@/components/event/Tab3";
import { useStore } from "@/hooks";
import { useParams, useRouter } from "next/navigation";
import SlotBookingTab from "@/components/event/Tab2/SlotBookingTab";
import { IEvent } from "@/types/event.type";

interface IVenueListing {
	setPageType: React.Dispatch<React.SetStateAction<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">>;
	currentPage: number;
	setCurrentPage: any;
}

export default function VenueListing({ setPageType, currentPage, setCurrentPage }: IVenueListing) {
	const router = useRouter();
	const params = useParams();
	const id = params.id;
	const { event, dispatch, setEvent } = useStore();

	const updateEvent = (newEventData: Partial<IEvent>) => {
		dispatch(setEvent({ ...event, ...newEventData }));
	};

	return (
		<>
			<div className="min-h-screen  flex flex-col">
				<div className="bg-white p-4 flex flex-col ">
					<h1 className="text-2xl font-medium text-center text-[#1F1F1F]">{id ? "Edit" : "List"} Venue</h1>
				</div>

				<ProgressBar currentPage={currentPage} />

				<main className=" p-4">
					{currentPage === 0 ? (
						<GeneralInfoTabVenue
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
							event={event}
							updateEvent={updateEvent}
						/>
					) : currentPage === 1 ? (
						<SlotBookingTab
							handlePageTransition={setCurrentPage}
							currentPage={currentPage}
							isHaveSlots={true}
							isMultipleDays={true}
							isTeamEvent={false}
							event={event}
							updateEvent={updateEvent}
							isMaxParticipants={false}
						/>
					) : (
						<BookingTab setPageType={setPageType} event={event} updateEvent={updateEvent} />
					)}
				</main>
			</div>
		</>
	);
}
