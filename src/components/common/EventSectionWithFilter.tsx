"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useState } from "react";
import { FilterDropDown } from "@/components/Dashboard/FilterDropDown";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import EventCard from "@/components/common/EventCard";
import { trpc } from "@/app/provider";

interface EventFilters {
	title: string;
	categoryId: number;
	subCategoryId: number;
	eventType: string;
	status: string;
	startDate: string;
	endDate: string;
	page: number;
	limit: number;
}

export default function EventSectionWithFilter() {
	const [timeFilter, setTimeFilter] = useState<"today" | "this_week" | "this_month" | "all_time">("today");

	// const [isEventLoading, setIsEventLoading] = useState(false);
	const [filters, setFilters] = useState<EventFilters>({
		title: "",
		categoryId: 0,
		subCategoryId: 0,
		eventType: "",
		status: "all",
		startDate: "",
		endDate: "",
		page: 1,
		limit: 10,
	});

	const { data: eventsData, isLoading: isEventLoading } = trpc.event.getEvents.useInfiniteQuery(
		{
			limit: filters.limit,
			timeFilter: timeFilter,
			title: filters.title,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			keepPreviousData: false,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.items);
	}, [eventsData]);

	// const handleFilterUpdate = (value: string | number, key: string) => {
	// 	setFilters((prevState) => ({
	// 		...prevState,
	// 		[key]: value,
	// 	}));
	// };

	// const handleFilterUpdate = (value: string | number, key: string) => {
	// 	setFilters((prevState) => ({
	// 		...prevState,
	// 		[key]: value,
	// 	}));
	// };

	const scrollContainerRef = React.useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		if (scrollContainerRef.current) {
			const scrollAmount = direction === "left" ? -400 : 400;
			scrollContainerRef.current.scrollBy({
				left: scrollAmount,
				behavior: "smooth",
			});
		}
	};

	const handleTimeFilterChange = (value: string) => {
		const filterMap: {
			[key: string]: "today" | "this_week" | "this_month" | "all_time";
		} = {
			today: "today",
			"this week": "this_week",
			"this month": "this_month",
			"all time": "all_time",
		};
		setTimeFilter(filterMap[value]);
	};

	const getTimeFilterLabel = (filter: string) => {
		const labels = {
			today: "Today's",
			this_week: "This Week's",
			this_month: "This Month's",
			all_time: "All Time",
		};
		return labels[filter as keyof typeof labels];
	};

	// Calculate stats from eventsData
	// const stats = React.useMemo(() => {
	// 	if (!eventsData?.events) {
	// 		return {
	// 			totalEvents: 0,
	// 			totalBookings: 0,
	// 			totalRevenue: 0,
	// 		};
	// 	}

	// 	return eventsData.events.reduce(
	// 		(acc) => {
	// 			return {
	// 				totalEvents: acc.totalEvents + 1,
	// 				totalBookings: 0,
	// 				totalRevenue: 0,
	// 			};
	// 		},
	// 		{ totalEvents: 0, totalBookings: 0, totalRevenue: 0 },
	// 	);
	// }, [eventsData]);

	return (
		<main className="flex-1 min-h-screen overflow-auto mt-[84px] w-full">
			<div className="bg-white rounded-lg min-h-screen overflow-y-auto">
				<div className="flex flex-row items-center justify-between mb-6 pr-3">
					<h2 className="text-black text-[28px] font-medium">Dashboard</h2>

					<div className="flex flex-row gap-7 items-center">
						<FilterDropDown onValueChange={handleTimeFilterChange} />
					</div>
				</div>

				{/* Stats */}

				<div className="relative">
					<div className="flex flex-row justify-between items-center mb-6">
						<h2 className="text-[24px] font-bold">{getTimeFilterLabel(timeFilter)} Events & Classes</h2>
						<div className="flex justify-center items-center max-h-[32px] gap-4">
							<Button
								onClick={() => scroll("left")}
								className=" rounded-[5px] bg-[#F1F1F1] p-2 hover:bg-[#F8EEE4] transition-all  "
							>
								<ChevronLeft className="w-7 h-7 text-[#000000]" />
							</Button>
							<Button
								onClick={() => scroll("right")}
								className=" rounded-[5px] p-2 bg-[#F1F1F1]  hover:bg-[#F8EEE4] transition-all "
							>
								<ChevronRight className="w-7 h-7 text-[#000000]" />
							</Button>
						</div>
					</div>

					<div className="relative group">
						<div
							ref={scrollContainerRef}
							className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide scroll-smooth"
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
							}}
						>
							{processedEvents.map((event: any, index: number) => (
								<div key={index} className="flex-none w-[350px]">
									<EventCard
										key={index}
										{...event}
										location={
											typeof event.location === "object" ? event.location.address : event.location
										}
										type="VENDOR"
										seatsLeft={
											event?.totalParticipants
												? event.totalParticipants
												: event.maximumParticipants
										}
										time={
											event.eventSpecificType === "VENUE"
												? `${event?.startingTime || ""} - ${event?.endingTime || ""}`
												: event?.startingTime || ""
										}
										title={event.title || `Venue-${event.tags} `}
										date={
											event.startDate
												? new Date(event.startDate)
														.toLocaleDateString("en-GB", {
															day: "2-digit",
															month: "2-digit",
															year: "numeric",
														})
														.replace(/\//g, "-")
												: event.weekDays?.join(", ")
										}
										status={event?.status?.toUpperCase() || "PENDING"}
										category={event?.eventType || event.sportName}
										price={event?.price || "1000"}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
