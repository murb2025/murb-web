import React, { useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import ProgressBar from "../ProgressBar";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks";
import { useParams, useRouter } from "next/navigation";
import BookingTab from "@/components/event/Tab3";
import GeneralInfoTabType1 from "@/components/event/Tab1/GeneralInfoTabType1";
import SlotBookingTab from "@/components/event/Tab2/SlotBookingTab";
import { IEvent } from "@/types/event.type";
interface IVenueListing {
	setPageType: React.Dispatch<React.SetStateAction<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">>;
	currentPage: number;
	setCurrentPage: any;
}

export default function TrainerListing({ setPageType, currentPage, setCurrentPage }: IVenueListing) {
	const router = useRouter();
	// const { id } = router.query;
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
					<h1 className="text-2xl font-medium text-center ">{id ? "Edit" : "List as"} Trainer</h1>
				</div>

				<ProgressBar currentPage={currentPage} />

				<main className="p-4">
					{currentPage === 0 ? (
						<GeneralInfoTabType1
							title="Trainer"
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
							isNumberOfDays={false}
							isHaveSlots={true}
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
