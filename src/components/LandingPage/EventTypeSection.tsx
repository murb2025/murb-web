"use client";
import React, { useState } from "react";
import EventSection from "@/components/common/EventSection";
import { trpc } from "@/app/provider";
import useQuery from "@/hooks/useQuery";

const EventTypeSection = () => {
	const { getQuery } = useQuery();
	const eventSection = getQuery("event");
	const eventType = getQuery("type");
	// eslint-disable-next-line
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(10);

	const {
		data: eventsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isEventLoading,
	} = trpc.event.getEvents.useInfiniteQuery(
		{
			status: "PUBLISHED",
			limit: limit,
			eventSpecificType: eventType,
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
		<div id="eventType" className="scroll-mt-28 w-full px-4 sm:pr-0 sm:pl-8 md:pl-20">
			<EventSection
				title={eventType.includes("Events") ? "Events & Experiences" : eventType}
				name={"eventTypeFull"}
				processedEvents={processedEvents as any}
				isEventLoading={isEventLoading}
				listAll={eventSection === "eventTypeFull"}
				hasMore={hasNextPage}
				next={fetchNextPage}
				isFetching={isFetchingNextPage}
			/>
		</div>
	);
};

export default EventTypeSection;
