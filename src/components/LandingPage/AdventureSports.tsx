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

export default function AdventureSports() {
	const [timeFilter, setTimeFilter] = useState<"today" | "this_week" | "this_month" | "all_time">("this_month");
	const { location } = useStore();
	const [selectedCity, setSelectedCity] = useState(location.city || "");

	const { getQuery } = useQuery();

	const eventSection = getQuery("event");

	// eslint-disable-next-line
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

	const {
		data: eventsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isEventLoading,
	} = trpc.event.getEvents.useInfiniteQuery(
		{
			limit: filters.limit,
			timeFilter: timeFilter,
			sportType: "Adventure Sports",
			status: "PUBLISHED",
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);


	useEffect(() => {
		setSelectedCity(location.city);
	}, [location.city]);

	// const processedEvents = React.useMemo(() => {
	// 	if (!eventsData?.events) return [];

	// 	return eventsData.events;
	// }, [eventsData]);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.items);
	}, [eventsData]);

	return (
		<div id="popular" className="scroll-mt-24 px-4 sm:pr-0 sm:pl-8 md:pl-20">
			<EventSection
				title="Adventure Sports"
				name="adventure_sports"
				listAll={eventSection === "adventure_sports"}
				isEventLoading={isEventLoading}
				isFetching={isFetchingNextPage}
				processedEvents={processedEvents as any}
				hasMore={hasNextPage}
				next={fetchNextPage}
			/>
		</div>
	);
}
