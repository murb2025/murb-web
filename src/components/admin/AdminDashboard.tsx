"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { Hourglass, IndianRupee, ScrollText, Tickets } from "lucide-react";
import { trpc } from "@/app/provider";
import moment from "moment";
import EventSection from "../common/EventSection";
import { DateFilterDropDown } from "../common/DateFilterDropDown";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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

const DataTable1 = ({
	data,
	isEventLoading,
}: {
	data: {
		title: string;
		totalTickets: number;
		totalRevenue: number;
		startDate: string;
		endDate: string;
		multipleDays: boolean;
	}[];
	isEventLoading: boolean;
	handleDelete?: (_: boolean) => void;
	handleFilterUpdate: (_: string | number, __: string) => void;
	filters: EventFilters;
}) => {
	const tableHeaders = ["Event Name", "Date", "No. of Tickets", "Revenue"];

	return (
		<>
			<Table className="text-base">
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead className={" text-center whitespace-nowrap"} key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-[#FDFDFD]">
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item, index: number) => (
							<TableRow key={index}>
								<TableCell className="text-center whitespace-nowrap">{item.title}</TableCell>
								<TableCell className="text-center whitespace-nowrap">
									{item.multipleDays
										? moment(item.startDate).format("DD MMM, yyyy") +
											" to " +
											moment(item.endDate).format("DD MMM, yyyy")
										: moment(item.startDate).format("DD MMM, yyyy")}
								</TableCell>
								<TableCell className="text-center whitespace-nowrap">{item.totalTickets}</TableCell>
								<TableCell className="text-center whitespace-nowrap">₹ {item.totalRevenue}</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isEventLoading && data.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}
		</>
	);
};

const DataTable2 = ({
	data,
	isEventLoading,
}: {
	data: {
		id: string;
		name: string;
		email: string;
		avatarUrl: string;
		totalTickets: number;
		totalRevenue: number;
		totalListing: number;
	}[];
	isEventLoading: boolean;
	handleDelete?: (_: boolean) => void;
	handleFilterUpdate: (_: string | number, __: string) => void;
	filters: EventFilters;
}) => {
	const tableHeaders = ["S No", "Host Name", "Total Listing", "Total Bookings", "Tickets sold"];

	return (
		<>
			<Table className="text-base">
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead className={" text-center whitespace-nowrap "} key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-[#FDFDFD]">
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item, index: number) => (
							<TableRow key={index}>
								<TableCell className="text-center">{index + 1}</TableCell>
								<TableCell className="text-center">
									<div className="flex flex-row items-center gap-2">
										<Avatar>
											<AvatarImage src={item.avatarUrl} alt={item.email || ""} />
											<AvatarFallback>{item?.email?.charAt(0).toUpperCase()}</AvatarFallback>
										</Avatar>
										<div className="">
											<p className="font-medium text-left capitalize">{item.name}</p>
											<p className="text-sm text-gray-500">{item.email}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-center">{item.totalListing}</TableCell>
								<TableCell className="text-center">{item.totalTickets}</TableCell>
								<TableCell className="text-center">₹ {item.totalRevenue}</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isEventLoading && data.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}
		</>
	);
};

const AdminDashboard = () => {
	const [timeFilter, setTimeFilter] = React.useState<"today" | "this_week" | "this_month" | "all_time">("this_month");

	const [filters, setFilters] = React.useState<EventFilters>({
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
		isLoading: isEventLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = trpc.admin.getEvents.useInfiniteQuery(
		{
			limit: filters.limit,
			timeFilter: timeFilter,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);

	const { data: bookingData, isLoading: isBookingDataLoading } = trpc.admin.getBookedTicketDetails.useQuery({
		timeFilter: timeFilter,
	});

	const { data: topEventData, isLoading: isTopEventDataLoading } = trpc.admin.getTopEvents.useQuery({
		// timeFilter: timeFilter,
		limit: 5,
	});

	const { data: topVendorData, isLoading: isTopVendorDataLoading } = trpc.admin.getTopVendor.useQuery({
		// timeFilter: timeFilter,
		limit: 5,
	});

	// console.log(topEventData);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.events);
	}, [eventsData]);

	const handleFilterUpdate = (value: string | number, key: string) => {
		setFilters((prevState) => ({
			...prevState,
			[key]: value,
		}));
	};

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
			<div className="flex flex-row items-center justify-between mb-4 p-2">
				<h2 className="text-black text-2xl font-medium">Admin Dashboard</h2>

				<div className="flex flex-row gap-7 items-center">
					<DateFilterDropDown onValueChange={handleTimeFilterChange} defaultValue={timeFilter} />
				</div>
			</div>

			{/* Stats */}
			<div className="grid md:grid-cols-4 gap-4 md:gap-12 mb-8">
				{[
					{
						title: `${getTimeFilterLabel(timeFilter)} Listing`,
						value: bookingData?.totalListedEvents || 0,
						icon: <ScrollText className="w-8 h-8 text-[#4C2818]/60" />,
					},
					{
						title: `${getTimeFilterLabel(timeFilter)} Pending`,
						value: bookingData?.totalPendingEvents || 0,
						icon: <Hourglass className="w-8 h-8 text-[#4C2818]/60" />,
					},
					{
						title: `${getTimeFilterLabel(timeFilter)} Bookings`,
						value: bookingData?.totalTicket || 0,
						icon: <Tickets className="w-8 h-8 text-[#4C2818]/60" />,
					},
					{
						title: `${getTimeFilterLabel(timeFilter)} Revenue`,
						value: `₹${bookingData?.totalRevenue || 0}`,
						icon: <IndianRupee className="w-8 h-8 text-[#4C2818]/60" />,
					},
					// {
					// 	title: `${getTimeFilterLabel(timeFilter)} Amount`,
					// 	value: `₹${bookingData?.totalAmount || 0}`,
					// 	icon: <IndianRupee className="w-8 h-8 text-[#4C2818]/60" />,
					// }
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

			<div className="my-10 flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Top Events</h2>
				<DataTable1
					data={(topEventData?.events as any) || []}
					isEventLoading={isTopEventDataLoading}
					handleDelete={() => {}}
					handleFilterUpdate={handleFilterUpdate}
					filters={filters}
				/>
			</div>

			<div className="my-10 flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Top Hosts</h2>
				<DataTable2
					data={(topVendorData?.users as any) || []}
					isEventLoading={isTopVendorDataLoading}
					handleDelete={() => {}}
					handleFilterUpdate={handleFilterUpdate}
					filters={filters}
				/>
			</div>

			<div className="relative">
				<div className="flex flex-row justify-between items-center my-6">
					<h2 className="text-xl font-semibold">{getTimeFilterLabel(timeFilter)} Listed Events</h2>
				</div>
				<EventSection
					title=""
					processedEvents={processedEvents as any}
					isEventLoading={isEventLoading}
					type="ADMIN"
					listAllUrl="/admin/dashboard/events"
					hasMore={hasNextPage}
					next={fetchNextPage}
					isFetching={isFetchingNextPage}
				/>
			</div>
		</main>
	);
};

export default AdminDashboard;
