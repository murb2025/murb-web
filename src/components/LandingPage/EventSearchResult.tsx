"use client";
import React, { useState } from "react";
import EventSection from "@/components/common/EventSection";
import { trpc } from "@/app/provider";
import useQuery from "@/hooks/useQuery";

interface EventFilters {
	title: string;
	status: string;
	startDate: string;
	endDate: string;
	page: number;
	limit: number;
	searchQuery: string;
}

export default function ExploreResultSection() {
	const [timeFilter, setTimeFilter] = useState<"today" | "this_week" | "this_month" | "all_time">("all_time");
	const { getQuery } = useQuery();

	const searchQuery = getQuery("query");

	// eslint-disable-next-line
	const [filters, setFilters] = useState<EventFilters>({
		title: "",
		searchQuery: searchQuery,
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
	} = trpc.event.search.useInfiniteQuery(
		{
			query: searchQuery,
			limit: filters.limit,
		},
		{
			getNextPageParam: (lastPage) => lastPage?.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.events);
	}, [eventsData]);

	if (eventsData?.pages[0].events.length === 0) {
		return (
			<div className="w-full">
				<EventSection
					searchQuery={searchQuery.toString()}
					name="search"
					isEventLoading={isEventLoading}
					processedEvents={[]}
					listAll={true}
					hasMore={hasNextPage}
					next={fetchNextPage}
					isFetching={isFetchingNextPage}
				/>
			</div>
		);
	}

	// console.log("Processed events:", eventsData);

	return (
		<div className="w-full px-4 sm:pl-8 md:pl-20">
			<EventSection
				searchQuery={searchQuery.toString()}
				name="search"
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
