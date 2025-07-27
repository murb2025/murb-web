"use client";
import React, { useState } from "react";
import { trpc } from "@/app/provider";
import EventSection from "@/components/common/EventSection";

export default function SavedBookings() {
	const [timeFilter, setTimeFilter] = useState<"today" | "this_week" | "this_month" | "all_time">("all_time");
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
	});

	const { data: bookmarkedEvents, isLoading: isBookmarkedEventsLoading } = trpc.bookmark.getBookmarkedEvents.useQuery(
		{
			timeFilter: timeFilter,
			page: filters.page,
			limit: filters.limit,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!bookmarkedEvents?.events) return [];
		return bookmarkedEvents.events;
	}, [bookmarkedEvents]);

	// console.log(bookmarkedEvents);

	const handleTimeFilterChange = (value: string) => {
		setTimeFilter(value as "today" | "this_week" | "this_month" | "all_time");
	};

	return (
		<main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 px-4 sm:px-6 md:px-10 lg:px-20 mt-20 sm:mt-20">
			<EventSection
				title="Bookmarked Events"
				processedEvents={processedEvents as any}
				isEventLoading={isBookmarkedEventsLoading}
				timeFilter={timeFilter}
				handleTimeFilterChange={handleTimeFilterChange}
				listAll={true}
				backButton={false}
			/>
		</main>
	);
}
