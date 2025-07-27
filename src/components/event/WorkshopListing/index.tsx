"use client";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import ProgressBar from "@/components/event/ProgressBar";
import BookingTab from "@/components/event/Tab3";
import GeneralInfoTabType1 from "@/components/event/Tab1/GeneralInfoTabType1";
import SlotBookingTab from "@/components/event/Tab2/SlotBookingTab";
import { IEvent } from "@/types/event.type";

interface IVenueListing {
	setPageType: React.Dispatch<React.SetStateAction<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">>;
	currentPage: number;
	setCurrentPage: any;
}

export default function WorkShopListing({ setPageType, currentPage, setCurrentPage }: IVenueListing) {
	const router = useRouter();
	const params = useParams();
	const id = params.id;
	const { event, setEvent, dispatch } = useStore();
	const updateEvent = (newEventData: Partial<IEvent>) => {
		dispatch(setEvent({ ...event, ...newEventData }));
	};

	return (
		<>
			<div className="min-h-screen flex flex-col">
				<div className="bg-white p-4 flex flex-col">
					<h1 className="text-2xl font-normal text-[#1F1F1F] text-center">
						{id ? "Edit" : "List"} Classes/ Sessions
					</h1>
				</div>

				<ProgressBar currentPage={currentPage} />

				<main className=" p-4">
					{currentPage === 0 ? (
						<GeneralInfoTabType1
							title="Workshop"
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
							isNumberOfDays={true}
							isTeamEvent={false}
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
