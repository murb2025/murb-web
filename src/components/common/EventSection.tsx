"use client";
import React, { useRef, useCallback } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react";
import EventCard from "./EventCard"; // Make sure this path is correct
import { Button } from "@/components/ui/button"; // Make sure this path is correct
import useQuery from "@/hooks/useQuery"; // Make sure this path is correct
import EventNotFound from "./EventNotFound"; // Make sure this path is correct
import { usePathname, useRouter } from "next/navigation";
import { DateFilterDropDown } from "./DateFilterDropDown"; // Make sure this path is correct
import { EventTypeFilter } from "./EventTypeFilter"; // Make sure this path is correct
import { IEvent } from "@/types/event.type"; // Make sure this path is correct
import { useSession } from "next-auth/react";
import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Make sure this path is correct
import EventCardLoader from "./EventCardLoader";

interface EventSectionProps {
	backButton?: boolean;
	title?: string;
	searchQuery?: string;
	processedEvents: Partial<IEvent>[];
	isEventLoading: boolean;
	name?: string;
	type?: "BUYER" | "VENDOR" | "ADMIN" | "BANNER" | "BOOKING" | "PROMOTION" | "TRENDING";
	listAll?: boolean;
	listAllUrl?: string;
	timeFilter?: "today" | "this_week" | "this_month" | "all_time";
	handleTimeFilterChange?: (value: string) => void;
	handleEventTypeFilterChange?: (value: string) => void;
	hasMore?: boolean;
	next?: () => void;
	isFetching?: boolean;
}

const EventSection: React.FC<EventSectionProps> = ({
	backButton = true,
	title,
	searchQuery,
	processedEvents = [],
	isEventLoading,
	name,
	type,
	listAll,
	listAllUrl,
	timeFilter,
	handleTimeFilterChange,
	handleEventTypeFilterChange,
	hasMore,
	next,
	isFetching,
}) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const { updateAndPushQuery } = useQuery();
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();
	const [open, setOpen] = React.useState(false);
	const lastEventElementRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isEventLoading || !hasMore || !next) return;

			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						next();
					}
				},
				{
					threshold: 0.5,
					rootMargin: "100px",
				},
			);

			if (node) {
				observer.observe(node);
			}

			return () => {
				if (node) {
					observer.unobserve(node);
				}
				observer.disconnect();
			};
		},
		[isEventLoading, hasMore, next],
	);

	const scroll = (direction: "left" | "right") => {
		if (scrollContainerRef.current) {
			const scrollAmount = direction === "left" ? -400 : 400;
			scrollContainerRef.current.scrollBy({
				left: scrollAmount,
				behavior: "smooth",
			});
		}
	};

	const handleClick = () => {
		if (type === "VENDOR" || type === "ADMIN") {
			router.push(listAllUrl || "/vendor/dashboard");
		} else if (type === "PROMOTION") {
			router.push(`${pathname}?${"view"}=${"all"}`);
		} else {
			updateAndPushQuery({
				event: name as string,
			});
		}
	};

	const renderEvents = () => (
		<>
			{!isEventLoading ? (
				processedEvents && processedEvents.length > 0 ? (
					processedEvents.map((event, index: number) => {
						const isLast = index === processedEvents.length - 1;
						const pacakgeDetail = event?.bookingDetails && event?.bookingDetails[0];
						return (
							<div
								key={event.id}
								className="flex-none w-[calc(100%-1rem)] min-[400px]:w-[350px]"
								ref={isLast ? lastEventElementRef : null} // Attach ref to the last element
							>
								<EventCard
									{...event}
									eventData={event}
									isBookmarkedValue={
										event.bookmark?.find((bok) => bok?.userId === session?.user?.id) ? true : false
									}
									tags={event.tags || ""}
									images={event.images || []}
									eventId={event.id!}
									location={
										event.isOnline
											? "Online event"
											: event.isHomeService
												? `Home Service in ${event.landmark}, ${event.city}, ${event.state}, ${event.country}`
												: `${event.landmark}, ${event.city}, ${event.state}, ${event.country}`
									}
									type={type || "BUYER"}
									seatsLeft={
										pacakgeDetail?.type !== "SUBSCRIPTION"
											? (event._count?.bookingChart &&
													(event._count?.bookingChart === 1
														? `${event.maximumParticipants! - event._count?.bookingChart} tickets left`
														: `${event.slots?.length} slots`)) ||
												""
											: `monthly subscription`
									}
									time={`${event?.startingTime || ""} - ${event?.endingTime || ""}`}
									title={event.title || `Venue-${event.tags} `}
									date={
										event.multipleDays
											? moment(event.startDate).format("DD MMM, YYYY") +
												" to " +
												moment(event.endDate).format("DD MMM, YYYY")
											: moment(event.startDate).format("DD MMM, YYYY")
									}
									status={event?.status?.toUpperCase() || "PENDING"}
									category={event?.eventSpecificType || event?.sportType}
									price={pacakgeDetail!}
								/>
							</div>
						);
					})
				) : (
					<EventNotFound />
				)
			) : (
				[1, 2, 3, 4].map((_, idx) => (
					<div key={idx} className="flex-none w-[calc(100%-1rem)] min-[400px]:w-[350px]">
						<EventCardLoader key={idx} type="BUYER" />
					</div>
				))
			)}
		</>
	);

	return (
		<div className="relative h-full">
			{listAll && backButton && (
				<Button onClick={() => router.back()} variant="ghost">
					<ArrowLeft />
				</Button>
			)}
			<div className="flex justify-between items-center mb-3 md:mb-6">
				<h2 className="text-2xl sm:text-3xl font-bold">
					{title ||
						(searchQuery && (
							<span>
								Showing result based on your{" "}
								<q>
									<i>{searchQuery}</i>{" "}
								</q>
							</span>
						))}
				</h2>
				<div className="hidden md:flex items-center gap-4 md:pr-20">
					{timeFilter && handleTimeFilterChange && (
						<DateFilterDropDown defaultValue={timeFilter} onValueChange={handleTimeFilterChange} />
					)}
					{handleEventTypeFilterChange && <EventTypeFilter onValueChange={handleEventTypeFilterChange} />}
				</div>
				<div className="md:hidden">
					{timeFilter && handleEventTypeFilterChange && (
						<Dialog open={open} onOpenChange={setOpen}>
							<DialogTrigger asChild>
								<Filter className="mr-6" />
							</DialogTrigger>
							<DialogContent className="w-full grid gap-4">
								<DialogHeader>
									<DialogTitle>Add filters</DialogTitle>
								</DialogHeader>

								{timeFilter && handleTimeFilterChange && (
									<DateFilterDropDown
										defaultValue={timeFilter}
										onValueChange={handleTimeFilterChange}
									/>
								)}
								{handleEventTypeFilterChange && (
									<EventTypeFilter onValueChange={handleEventTypeFilterChange} />
								)}
								<Button variant={"outline"} onClick={() => setOpen(false)}>
									Done
								</Button>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			<div className="relative group h-full">
				{listAll ? (
					<>
						<div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 pb-4 px-2 sm:px-0">
							{renderEvents()}
							{isFetching &&
								[1, 2].map((_, idx) => (
									<div key={idx} className="flex-none w-[calc(100%-1rem)] min-[400px]:w-[350px]">
										<EventCardLoader key={idx} type="BUYER" />
									</div>
								))}
						</div>
						{!hasMore && processedEvents?.length > 0 && (
							<div className="flex justify-center py-4">You have reached the end of the list</div>
						)}
					</>
				) : (
					<div
						ref={scrollContainerRef}
						className={`flex ${
							processedEvents?.length === 1 ? "justify-center sm:justify-start" : "overflow-x-auto"
						} gap-3 sm:gap-6 pb-4 scrollbar-hide scroll-smooth px-2 sm:px-0`}
						style={{
							scrollbarWidth: "none",
							msOverflowStyle: "none",
						}}
					>
						{renderEvents()}
						{isFetching &&
							[1, 2].map((_, idx) => (
								<div key={idx} className="flex-none w-[calc(100%-1rem)] min-[400px]:w-[350px]">
									<EventCardLoader key={idx} type="BUYER" />
								</div>
							))}
					</div>
				)}
			</div>

			{processedEvents?.length > 0 && !listAll && (
				<div className="flex justify-center mt-4">
					<Button
						onClick={() => scroll("left")}
						className="absolute left-2 sm:left-4 -translate-x-4 z-10 bg-white rounded-full p-1.5 sm:p-2 border border-[#585858] hover:bg-gray-50 transition-all group-hover:-translate-x-6"
					>
						<ChevronLeft className="w-6 h-6 text-[#585858]" />
					</Button>
					<Button
						onClick={() => scroll("right")}
						className="absolute left-2 sm:left-4 translate-x-10 z-10 bg-white rounded-full p-1.5 sm:p-2 border border-[#585858] hover:bg-gray-50 transition-all group-hover:translate-x-6"
					>
						<ChevronRight className="w-6 h-6 text-[#585858]" />
					</Button>
					<Button disabled={isEventLoading} onClick={handleClick}>
						View All
					</Button>
				</div>
			)}
		</div>
	);
};

export default EventSection;
