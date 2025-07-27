"use client";
import { trpc } from "@/app/provider";
import React from "react";
import EventSection from "@/components/common/EventSection";

export default function Bookings() {
	const [filters, setFilters] = React.useState({
		page: 1,
		limit: 10,
		timeFilter: "all_time",
	});
	const {
		data: eventsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isEventLoading,
	} = trpc.booking.getBookedTicket.useInfiniteQuery(
		{
			limit: filters.limit,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			keepPreviousData: false,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages[0].events) return [];

		return eventsData.pages.flatMap((page) => page.events);
	}, [eventsData]);

	return (
		<main className="">
			<div className="w-full ">
				<div className="flex w-full justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
				</div>

				<EventSection
					processedEvents={(processedEvents as any) || []}
					isEventLoading={isEventLoading}
					listAll={true}
					type="BOOKING"
					backButton={false}
					next={fetchNextPage}
					hasMore={hasNextPage}
					isFetching={isFetchingNextPage}
				/>
			</div>
		</main>
	);
}
