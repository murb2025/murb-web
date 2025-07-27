"use client";
import React, { useState, useCallback, useRef } from "react";
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
	cursor: string | null; // Use cursor instead of page
	limit: number;
}

export default function Trending() {
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
		cursor: null, // Initial cursor is null
		limit: 10,
	});

	const {
		data: trendingEventsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isTrendingEventLoading,
	} = trpc.trending.getOnlyTrendingEvents.useInfiniteQuery(
		{
			limit: filters.limit,
			trended: true,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);


	const processedTrendingEvents = React.useMemo(() => {
		if (!trendingEventsData?.pages) return [];
		return trendingEventsData.pages.flatMap((page) => page.data);
	}, [trendingEventsData]);


	return (
		<div className="px-4 sm:pr-0 sm:pl-8 md:pl-20">
			<EventSection
				title="Trending"
				name="trending"
				listAll={eventSection === "trending"}
				isEventLoading={isTrendingEventLoading}
				isFetching={isFetchingNextPage}
				processedEvents={processedTrendingEvents as any}
				hasMore={hasNextPage}
				next={fetchNextPage}
			/>
		</div>
	);
}
