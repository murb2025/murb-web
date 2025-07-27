"use client";
import React, { useState } from "react";
import EventSection from "@/components/common/EventSection";
import { trpc } from "@/app/provider";
import useQuery from "@/hooks/useQuery";

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

export default function ExploreResultSection() {
	const [timeFilter, setTimeFilter] = useState<"today" | "this_week" | "this_month" | "all_time">("all_time");
	const [eventType, setEventType] = useState("");
	const { getQuery } = useQuery();

	const selectedEventSpecificType = getQuery("category");
	const selectedSportType = getQuery("sportCategory");
	const selectedTag = getQuery("sport");

	// eslint-disable-next-line
	const [filters, setFilters] = useState<EventFilters>({
		title: "",
		categoryId: 0,
		subCategoryId: 0,
		eventType: selectedEventSpecificType,
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
			status: "PUBLISHED",
			limit: filters.limit,
			timeFilter: timeFilter,
			title: filters.title,
			...(selectedEventSpecificType && { eventSpecificType: selectedEventSpecificType }),
			...(selectedSportType && { sportType: selectedSportType }),
			...(selectedTag && { tag: selectedTag }),
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.items);
	}, [eventsData]);

	return (
		<div className="w-full px-4 sm:pl-8 md:pl-20">
			<EventSection
				title="Showing result based on your search"
				name="explore"
				isEventLoading={isEventLoading}
				processedEvents={processedEvents as any}
				listAll={true}
				hasMore={hasNextPage}
				next={fetchNextPage}
				isFetching={isFetchingNextPage}
			/>
		</div>
	);
}
