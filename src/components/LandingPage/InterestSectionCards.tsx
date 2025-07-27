"use client";
import React, { useState } from "react";
import EventSection from "@/components/common/EventSection";
import { trpc } from "@/app/provider";
import { notFound, useSearchParams } from "next/navigation";
import useQuery from "@/hooks/useQuery";

interface EventFilters {
	page: number;
	limit: number;
}

export default function InterestSectionCards() {
	const { getQuery } = useQuery();
	const eventSection = getQuery("event");
	// eslint-disable-next-line
	const [filters, setFilters] = useState<EventFilters>({
		page: 1,
		limit: 10,
	});

	const searchParams = useSearchParams();

	const interest = searchParams.get("interest") as string;

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
			tagsArrayString: interest,
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

	if (interest === "" || interest === null) {
		return notFound();
	}

	return (
		<div className="w-full px-4 sm:pl-8 md:pl-20">
			<EventSection
				title={`Showing Results for ${interest.split("|").join(", ")}`}
				isEventLoading={isEventLoading}
				processedEvents={processedEvents as any}
				listAll={eventSection === "interest"}
				hasMore={hasNextPage}
				next={fetchNextPage}
				isFetching={isFetchingNextPage}
			/>
		</div>
	);
}
