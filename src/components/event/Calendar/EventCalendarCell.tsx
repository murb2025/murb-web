import React from "react";
import { EventListItem } from "./EventCalendar";
import { Lock, BadgeInfo } from "lucide-react";
import moment from "moment";
import Image from "next/image";

interface EventCalendarCellProps {
	date: Date;
	eventList: EventListItem[];
}

const EventCalendarCell: React.FC<EventCalendarCellProps> = ({ date, eventList }) => {
	const dateStr = moment(date).format("YYYY-MM-DD");

	if (!eventList.length) return null;

	// Determine the cell's background color based on booking states
	const determineCellColor = (events: EventListItem[]) => {
		// If any event has a single booking slot with booking disabled
		const singleDisabledSlotEvent = events.some((event) => {
			const bookingChartEntry = event.eventData.bookingChart?.find((b) => b.date === dateStr);
			return (
				bookingChartEntry &&
				!bookingChartEntry.isBookingEnabled &&
				event.eventData.bookingChart?.filter((b) => b.date === dateStr).length === 1
			);
		});

		// If any event has multiple slots and at least one is disabled
		const multipleDisabledSlotEvent = events.some((event) => {
			const bookingChartEntries = event.eventData.bookingChart?.filter((b) => b.date === dateStr) || [];
			return bookingChartEntries.length > 1 && bookingChartEntries.some((entry) => !entry.isBookingEnabled);
		});

		if (singleDisabledSlotEvent) return "bg-red-100 border-red-200";
		if (multipleDisabledSlotEvent) return "bg-yellow-100 border-yellow-200";
		return "bg-slate-100 border-slate-200";
	};

	const displayList = eventList.filter((_, index) => index < 2);
	const moreCount = eventList.length - displayList.length;
	const cellColorClass = determineCellColor(eventList);

	return (
		<div className="relative cursor-pointer">
			<div className={`text-left grid gap-2 mt-6 p-2 rounded-lg ${cellColorClass}`}>
				{displayList.map((item, index) => {
					const bookingChartEntry = item.eventData.bookingChart?.find((b) => b.date === dateStr);
					const isEventBookingEnabled = bookingChartEntry?.isBookingEnabled ?? true;

					return (
						<div
							key={index}
							className="overflow-hidden w-full text-ellipsis whitespace-nowrap rounded-md bg-white shadow-sm"
						>
							<div className="flex items-center justify-between">
								<div className="relative h-full w-20 rounded-lg aspect-video overflow-hidden">
									<Image
										src={Array.isArray(item.eventData?.images) ? item.eventData?.images[0] : ""}
										alt={"Event"}
										fill
										className="object-contain"
									/>
								</div>
								<div className="flex-grow overflow-hidden">
									<div className="flex items-center">
										<BadgeInfo
											className={`mr-2 w-4 h-4 ${
												isEventBookingEnabled ? "text-green-500" : "text-red-500"
											}`}
										/>
										<div className="flex-grow overflow-hidden">
											<div className="font-semibold text-xs">
												{item.eventData.status === "PENDING" ? "Pending" : ""}
											</div>
											{/* <div className="text-xs text-gray-500 truncate">
												{moment(item.eventData.startDate).format("DD MMM, YYYY")}{" "}
												{item.eventData.multipleDays &&
													"-" + moment(item.eventData.endDate).format("DD MMM, YYYY")}
											</div> */}
											<section>
												<div className="text-xs font-semibold">Status</div>
												{bookingChartEntry?.isBookingEnabled &&
													(item.eventData.isMonthlySubscription ? (
														<div className="text-xs text-blue-600">
															{bookingChartEntry?.bookedSeats}
														</div>
													) : (
														<div className="text-xs text-blue-600">
															{bookingChartEntry?.bookedSeats} /{" "}
															{item.eventData.maximumParticipants}
														</div>
													))}
											</section>
										</div>
									</div>
								</div>
								{!isEventBookingEnabled && <Lock className="h-4 w-4 text-red-500 ml-2" />}
							</div>
						</div>
					);
				})}
				{moreCount > 0 && (
					<div className="text-center text-xs text-gray-600 font-medium mt-1">
						+{moreCount} more event{moreCount > 1 ? "s" : ""}
					</div>
				)}
			</div>
		</div>
	);
};

export default EventCalendarCell;
