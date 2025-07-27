"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/app/provider";
import { BuyerDetailTable } from "@/components/common/BuyerDetailTable";
import { DateFilterDropDown } from "@/components/common/DateFilterDropDown";
import EventSection from "@/components/common/EventSection";
import { DollarSign, IndianRupee, ScrollText, Star, Tickets } from "lucide-react";

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

const HomePage = ({ vendorId, isAdmin }: { vendorId: string; isAdmin: boolean }) => {
	const router = useRouter();
	const [timeFilter, setTimeFilter] = React.useState<"today" | "this_week" | "this_month" | "all_time">("this_month");
	const [isProfileFilled, setIsProfileFilled] = React.useState(false);
	const [filters, setFilters] = React.useState<EventFilters>({
		title: "",
		categoryId: 0,
		subCategoryId: 0,
		eventType: "",
		status: "all",
		startDate: "",
		endDate: "",
		page: 1,
		limit: 5,
	});

	const {
		data: eventsData,
		isLoading: isEventLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.event.getVendorEvents.useInfiniteQuery(
		{
			limit: filters.limit,
			timeFilter: timeFilter,
			vendorId: vendorId,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);

	const { data: bookingData, isLoading: isBookingDataLoading } =
		trpc.booking.getBookedTicketDetailsForVendor.useQuery({
			timeFilter: timeFilter,
			limit: filters.limit,
			status: "SUCCESS",
			vendorId: vendorId,
		});

	trpc.user.checkProfileField.useQuery(undefined, {
		onSuccess: (data) => {
			setIsProfileFilled(data.isFilled);
		},
	});

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.events);
	}, [eventsData]);

	const handleTimeFilterChange = (value: string) => {
		setTimeFilter(value as any);
	};

	const getTimeFilterLabel = (filter: string) => {
		const labels = {
			today: "Today's",
			this_week: "This Week's",
			this_month: "This Month's",
			all_time: "All Time",
		};
		return labels[filter as keyof typeof labels];
	};

	return (
		<main className="flex-1 min-h-screen overflow-auto w-full">
			<div className="bg-white rounded-lg min-h-screen overflow-y-auto">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pr-3">
					<h2 className="text-black text-2xl font-medium">Host Dashboard</h2>

					<div className="flex flex-row mt-1 md:gap-7 justify-between items-center">
						<section>
							<DateFilterDropDown onValueChange={handleTimeFilterChange} defaultValue={timeFilter} />
						</section>
						{!isAdmin && (
							<Button
								variant="default"
								onClick={() => {
									router.push("/event/create");
								}}
							>
								Create Event
							</Button>
						)}
					</div>
				</div>

				{/* Stats */}
				<div className="grid md:grid-cols-3 gap-4 md:gap-12 mb-8">
					{[
						{
							title: `${getTimeFilterLabel(timeFilter)} Listing`,
							value: bookingData?.totalListedEvents || 0,
							icon: <ScrollText className="w-8 h-8 text-[#4C2818]/60" />,
						},
						{
							title: `${getTimeFilterLabel(timeFilter)} Bookings`,
							value: bookingData?.totalTicket || 0,
							icon: <Tickets className="w-8 h-8 text-[#4C2818]/60" />,
						},
						{
							title: `${getTimeFilterLabel(timeFilter)} Revenue`,
							value: `₹${new Intl.NumberFormat("en-IN").format(bookingData?.totalRevenue || 0)}`,
							icon: <IndianRupee className="w-8 h-8 text-[#4C2818]/60" />,
						},
						// {
						// 	title: `${getTimeFilterLabel(timeFilter)} Rating`,
						// 	value: bookingData?.totalRating || 0,
						// 	icon: <Star className="w-8 h-8 text-[#4C2818]/60" />,
						// },
					].map((stat) => (
						<div key={stat.title} className="bg-[#F8EEE4] p-4 shadow rounded-2xl flex flex-col gap-6">
							{/* <div> */}
							<section className="flex flex-row justify-between items-center gap-2">
								<h3 className="text-lg text-[#4C2818]">{stat.title}</h3>
								{stat.icon}
							</section>
							<p className="text-2xl text-[#4C2818] font-semibold">{stat.value}</p>
							{/* </div> */}
						</div>
					))}
				</div>

				<div className="relative">
					<h2 className="text-2xl font-medium">{getTimeFilterLabel(timeFilter)} Listed Events</h2>

					<EventSection
						processedEvents={processedEvents as any}
						isEventLoading={isEventLoading}
						listAll={false}
						type="VENDOR"
						listAllUrl={isAdmin ? "" : "/vendor/dashboard/events"}
						backButton={false}
						hasMore={hasNextPage}
						next={fetchNextPage}
						isFetching={isFetchingNextPage}
					/>
				</div>

				<div className="my-10 flex flex-col gap-4">
					<h2 className="text-2xl font-medium">{getTimeFilterLabel(timeFilter)} Buyers</h2>
					<BuyerDetailTable
						data={(bookingData?.bookingDetails as any) || []}
						isEventLoading={isEventLoading}
					/>
					{isAdmin ? (
						""
					) : bookingData?.bookingDetails.length ? (
						<Link href="/vendor/dashboard/buyer" className="flex justify-center mt-4 w-full">
							<Button variant={"custom"}>See All</Button>
						</Link>
					) : (
						""
					)}
				</div>
			</div>
		</main>
	);
};

export default HomePage;
