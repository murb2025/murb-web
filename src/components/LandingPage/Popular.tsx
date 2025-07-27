"use client";
import React, { useEffect, useState } from "react";
import EventSection from "@/components/common/EventSection";
import { trpc } from "@/app/provider";
import useQuery from "@/hooks/useQuery";
import { useStore } from "@/hooks";

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

export default function Popular() {
	const [timeFilter, setTimeFilter] = useState<"today" | "this_week" | "this_month" | "all_time">("this_month");
	const { location } = useStore();
	const [eventType, setEventType] = useState("");
	const [selectedCity, setSelectedCity] = useState("");

	const { getQuery } = useQuery();
	const eventSection = getQuery("event");

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

	// Update selected city when location changes
	useEffect(() => {
		setSelectedCity(location.city === "All" ? "" : location.city);
	}, [location.city]);

	const {
		data: eventsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isEventLoading,
	} = trpc.event.getEvents.useInfiniteQuery(
		{
			limit: filters.limit,
			timeFilter,
			title: filters.title,
			eventSpecificType: eventType,
			status: "PUBLISHED",
			showTopRated: true,
			...(selectedCity ? { city: selectedCity } : {}),
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			keepPreviousData: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		},
	);

	const handleTimeFilterChange = (value: string) => {
		const filterMap: {
			[key: string]: "today" | "this_week" | "this_month" | "all_time";
		} = {
			today: "today",
			this_week: "this_week",
			this_month: "this_month",
			all_time: "all_time",
		};
		setTimeFilter(filterMap[value]);
	};

	const handleEventTypeFilterChange = (value: string) => {
		setEventType(value);
	};

	// Memoize processed events to prevent unnecessary recalculations
	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.items);
	}, [eventsData]);

	return (
		<div id="popular" className="scroll-mt-24 px-4 sm:pr-0 sm:pl-8 md:pl-20">
			<EventSection
				title={`Top Rated ${selectedCity ? `in ${selectedCity}` : ""}`}
				name="popular"
				listAll={eventSection === "popular"}
				isEventLoading={isEventLoading}
				isFetching={isFetchingNextPage}
				processedEvents={processedEvents as any}
				hasMore={hasNextPage}
				next={fetchNextPage}
				timeFilter={timeFilter}
				handleTimeFilterChange={handleTimeFilterChange}
				handleEventTypeFilterChange={handleEventTypeFilterChange}
			/>
		</div>
	);
}
