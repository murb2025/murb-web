"use client";
import React from "react";
import EventSection from "@/components/common/EventSection";
import { trpc } from "@/app/provider";
import useQuery from "@/hooks/useQuery";
import { cn } from "@/lib/utils";

const Venues = () => {
	const { getQuery } = useQuery();
	const eventSection = getQuery("event");

	const {
		data: eventsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isEventLoading,
	} = trpc.event.getEvents.useInfiniteQuery(
		{
			limit: 10,
			status: "PUBLISHED",
			eventSpecificType: "VENUE",
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
		<div id="venue" className={cn("scroll-mt-28 px-4 sm:pr-0 sm:pl-8 md:pl-20")}>
			<EventSection
				title="Venues"
				name="venue"
				listAll={eventSection === "venue"}
				isEventLoading={isEventLoading}
				isFetching={isFetchingNextPage}
				processedEvents={processedEvents as any}
				hasMore={hasNextPage}
				next={fetchNextPage}
			/>
		</div>
	);
};

export default Venues;
