"use client";
import React, { useMemo, useRef, useState } from "react";
import { Calendar } from "rsuite";
import { Loader } from "lucide-react";
import { trpc } from "@/app/provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EventCalendarCell from "./EventCalendarCell";
import EventListPopover from "./EventListPopover";
import { IEvent } from "@/types/event.type";

export interface IBookingChartEntry {
	id: string;
	eventId: string;
	date: string;
	slot?: {
		startTime: string;
		endTime: string;
	};
	bookedSeats: number;
	isBookingEnabled: boolean;
}

export interface EventListItem {
	time: string;
	title: string;
	eventData: IEvent;
}

const EventCalendar = (): JSX.Element => {
	const [selectedEvent, setSelectedEvent] = useState<EventListItem | null>(null);
	const [showSlots, setShowSlots] = useState(false);
	const calendarRef = useRef<HTMLDivElement>(null);

	const { data, isLoading, error, refetch } = trpc.event.getVendorEvents.useInfiniteQuery(
		{
			limit: 100,
			timeFilter: "all_time",
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			keepPreviousData: false,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
		},
	);

	const processedEvents = useMemo(() => {
		return data?.pages.flatMap((page) => page.events) || [];
	}, [data]);

	// console.log(processedEvents);

	const getEventList = (date: Date): EventListItem[] => {
		return processedEvents
			.filter((serverEvent) => {
				if (!serverEvent.startDate) return false;

				if (serverEvent.multipleDays && serverEvent.endDate) {
					const startDate = new Date(serverEvent.startDate);
					const endDate = new Date(serverEvent.endDate);
					return (
						date >= new Date(startDate.setHours(0, 0, 0, 0)) &&
						date <= new Date(endDate.setHours(23, 59, 59, 999)) &&
						serverEvent.bookingChart.some((b) => b.date === date.toISOString().split("T")[0])
					);
				} else {
					const startDate = new Date(serverEvent.startDate);
					return (
						startDate.getDate() === date.getDate() &&
						startDate.getMonth() === date.getMonth() &&
						startDate.getFullYear() === date.getFullYear()
					);
				}
			})
			.map(
				(serverEvent): EventListItem =>
					({
						time:
							serverEvent.startingTime && serverEvent.endingTime
								? `${serverEvent.startingTime} - ${serverEvent.endingTime}`
								: `${new Date(serverEvent.startDate || "").toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}`,
						title:
							serverEvent.title ||
							`${serverEvent.eventSpecificType} ${serverEvent.tags}` ||
							"Untitled Event",
						eventData: {
							...serverEvent,
							startDate: serverEvent.startDate || "",
							endDate: serverEvent.endDate || "",
							startingTime: serverEvent.startingTime || "",
							endingTime: serverEvent.endingTime || "",
							maximumParticipants: serverEvent.maximumParticipants || 0,
							bookingChart: serverEvent.bookingChart.map((b) => ({
								...b,
								isBookingEnabled: b.isBookingEnabled ?? true,
								bookedSeats: b.bookedSeats || 0,
							})),
						},
					}) as any,
			);
	};

	const renderCell = (date: Date): JSX.Element | null => {
		const list = getEventList(date);
		return <EventCalendarCell date={date} eventList={list} />;
	};

	if (isLoading) {
		return (
			<div className="mt-[84px] flex items-center justify-center h-[400px] bg-white">
				<div className="flex flex-col items-center gap-2">
					<Loader className="w-8 h-8 animate-spin text-gray-500" />
					<p className="text-gray-600">Loading events...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mt-[84px] flex items-center justify-center h-[400px] bg-white">
				<div className="text-center">
					<p className="text-red-500 mb-2">Error: {error?.message}</p>
					<button
						onClick={() => refetch()}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="relative" ref={calendarRef}>
			<Calendar
				bordered
				renderCell={(date) => {
					const CellComponent = renderCell(date);
					if (!CellComponent) return null;

					return (
						<Popover>
							<PopoverTrigger className="w-full h-full">{CellComponent}</PopoverTrigger>
							<PopoverContent className="w-[300px] p-0" align="start">
								<EventListPopover
									date={date}
									eventList={getEventList(date)}
									setSelectedEvent={setSelectedEvent}
									showSlots={showSlots}
									setShowSlots={setShowSlots}
									refetch={refetch}
									selectedEvent={selectedEvent}
								/>
							</PopoverContent>
						</Popover>
					);
				}}
				className="bg-white h-[800px] [&_.rs-calendar-table]:!h-full [&_.rs-calendar-row]:!h-[16.66%] [&_.rs-calendar-table-cell]:!h-full [&_.rs-calendar-table-cell-content]:!h-full [&_.rs-calendar-table-cell-content]:!min-h-[120px]"
			/>
		</div>
	);
};

export default EventCalendar;
