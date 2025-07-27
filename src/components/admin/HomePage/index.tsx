import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import * as React from "react";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
// import {
// 	deleteEvent,
// 	getAllEvents,
// 	getEventStats,
// } from "@/connections/api/events.api";
import { LoadingSpinner } from "@/components/ui/loader";
import { formatDate } from "@/utils/date";

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
interface VendorFilters {
	name: string;
	vendorId: number;
	status: string;
	email: string;
	phone: string;
	regDate: string;
	page: number;
	limit: number;
}

const DataTable = ({
	data,
	isEventLoading,
	handleDelete,
	handleFilterUpdate,
	filters,
}: {
	data: any;
	isEventLoading: boolean;
	handleDelete: (_: boolean) => void;
	handleFilterUpdate: (_: string | number, __: string) => void;
	filters: EventFilters;
}) => {
	const tableHeaders = ["S No.", "Title", "Location", "Date", "Time", "Days", ""];

	const handleEventDelete = async () => {
		try {
			handleDelete(true);
			// const res = await deleteEvent(eventId);
			handleDelete(false);
			// console.log("response after deletion->>", res);
		} catch (err) {
			throw err;
		}
	};

	return (
		<>
			<Table>
				<TableHeader className="bg-[#F7F7F7]">
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead
								className={` text-center text-[18px] font-normal py-4 ${idx !== 0 ? "border-l-[1px]" : " "} `}
								key={header}
							>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-[#FDFDFD]">
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item: any, index: number) => (
							<TableRow key={index}>
								<TableCell className=" text-center text-[16px] font-normal text-[#6F6F6F]">
									{index + 1}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									{item.title ? item.title : item.name ? item.name : "Venue"}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									{item.location}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									{formatDate(item.date)}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									14:00 - 15:30
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									Single Day
								</TableCell>
								<TableCell className="border-l-[1px]">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="bg-none outline-none border-none">
												<IoEllipsisVerticalSharp size={20} />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="">
											<DropdownMenuItem className="py-1 px-2 border-b-[1px] border-solid ">
												Edit
											</DropdownMenuItem>

											<DropdownMenuItem
												className="py-1 px-2 "
												onClick={() => {
													handleEventDelete();
												}}
											>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{data.length > 0 && (
				<div className="py-2 px-2 flex flex-row justify-between items-center mt-6">
					<div className="flex flex-row gap-2 items-center w-[300px]">
						<div>
							<Select onValueChange={(value: any) => handleFilterUpdate(value, "limit")}>
								<SelectTrigger className="text-black">
									<SelectValue placeholder={filters.limit} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<p className="text-[16px] text-default-400 ">Items per page</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						<div
							onClick={() => {
								if (filters.page === 1) {
									return;
								}
								handleFilterUpdate(filters.page - 1, "page");
							}}
							className={`p-1 border-[1px] h-fit w-fit  ${filters.page === 1 ? "text-gray-600 opacity-60" : " hover:bg-gray-100 text-black font-bold"} rounded-md cursor-pointer`}
						>
							<ChevronLeftRegular fontSize={20} />
						</div>
						<div
							onClick={() => {
								if (data.length !== filters.limit) {
									return;
								}
								handleFilterUpdate(filters.page + 1, "page");
							}}
							className={`p-1 border-[1px] h-fit w-fit  ${
								data.length !== filters.limit
									? "text-gray-600 opacity-60"
									: " hover:bg-gray-100 text-black font-bold"
							} rounded-md cursor-pointer`}
						>
							<ChevronRightRegular fontSize={20} />
						</div>
					</div>
				</div>
			)}
			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isEventLoading && data.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}
		</>
	);
};

const AdminHomePage = () => {
	const router = useRouter();
	// eslint-disable-next-line
	const [events, setEvents] = useState<any>([]);
	const [isDeleting, setIsDeleting] = useState(false);
	// eslint-disable-next-line
	const [eventStats, setEventStats] = useState<any>({
		totalEvents: 0,
		liveEvents: 0,
		pendingEvents: 0,
		ticketSold: 0,
	});

	const [isEventLoading, setIsEventLoading] = useState(false);
	const [filters, setFilters] = useState<EventFilters>({
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
	// const [vendorFilters, setvendorFilters] = useState<VendorFilters>({
	// 	name: "",
	// 	vendorId: 0,
	// 	status: "all",
	// 	email: "",
	// 	phone: "",
	// 	regDate: "",
	// 	page: 1,
	// 	limit: 10,
	// });
	const handleFilterUpdate = (value: string | number, key: string) => {
		setFilters((prevState) => ({
			...prevState,
			[key]: value,
		}));
	};

	useEffect(() => {
		const fetchEventStats = async () => {
			// const res = await getEventStats();
			// if (res.statusCode === 200 && res?.data?.data) {
			// 	setEventStats(res?.data?.data);
			// }
		};
		const fetchAllEvents = async () => {
			setIsEventLoading(true);
			// const response = await getAllEvents({
			// 	title: filters.title,
			// 	status: filters.status === "all" ? "" : filters.status,
			// 	startDate: filters.startDate,
			// 	endDate: filters.endDate,
			// 	page: filters.page,
			// 	limit: filters.limit,
			// });
			// console.log("filter data", response);
			// if (response.statusCode === 200 && response?.data?.data) {
			// 	setEvents(response?.data?.data);
			// }
			setIsEventLoading(false);
		};

		fetchAllEvents();
		fetchEventStats();
	}, [filters, isDeleting, setIsDeleting]);

	return (
		<main className="flex-1 overflow-auto mt-[84px]">
			<div className="bg-white rounded-lg">
				<div className="flex flex-row items-center justify-between mb-6">
					<h2 className="text-black text-[28px] font-normal">Dashboard</h2>
					<Button
						className="bg-black text-white rounded-[8px] font-normal text-[15px]"
						onClick={() => {
							router.push("/event/create");
						}}
					>
						Create Event
					</Button>
				</div>

				{/* Event Stats */}
				<div className="grid grid-cols-4 gap-4 mb-8">
					{[
						{
							title: "TOTAL EVENTS",
							value: eventStats.totalEvents,
						},
						{ title: "LIVE EVENTS", value: eventStats.liveEvents },
						{
							title: "PENDING EVENTS",
							value: eventStats.pendingEvents,
						},
						{ title: "TICKETS SOLD", value: eventStats.ticketSold },
					].map((stat) => (
						<div key={stat.title} className="bg-[#F8EEE4] p-4 rounded-lg">
							<h3 className="text-[18px] text-[#4C2818] mb-2">{stat.title}</h3>
							<p className="text-[24px] text-[#4C2818] font-medium">{stat.value}</p>
						</div>
					))}
				</div>

				{/*Host Stats */}
				<h2 className="text-black text-[28px] font-normal mb-6">Hosts</h2>
				<div className="grid grid-cols-2 gap-4 mb-8 min-h-[120px]">
					{[
						{
							title: "TOTAL VENDORS",
							value: eventStats.totalEvents,
						},
						{
							title: "VENDOR APPROVAL REQUEST",
							value: eventStats.liveEvents,
						},
					].map((stat) => (
						<div key={stat.title} className="bg-[#F8EEE4] p-4 rounded-lg flex justify-between">
							<div className="flex flex-col">
								<h3 className="text-[18px] text-[#4C2818] mb-2">{stat.title}</h3>
								<p className="text-[40px] text-[#4C2818] font-medium mt-[46px]">{stat.value}</p>
							</div>
							{/* <PieChartComp count={stat.value} /> */}
						</div>
					))}
				</div>

				<div className="w-full flex flex-row gap-2 mb-[30px]">
					<div className="flex flex-row justify-between w-full px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
						<input
							placeholder="Search"
							className="bg-none w-full outline-none "
							value={filters.title}
							onChange={(e) => handleFilterUpdate(e.target.value, "title")}
						/>
						<IoSearch className="" size={24} />
					</div>
				</div>

				{/* Host List */}
				<div className="bg-white rounded-lg overflow-hidden w-full">
					<div className="flex justify-between items-center mb-4">
						<h1 className="font-medium text-[28px]"> Curators List</h1>
						<div className="space-x-2">
							{["pending", "published"].map((tab) => (
								<Button
									key={tab}
									variant={filters.status === tab ? "default" : "ghost"}
									onClick={() => handleFilterUpdate(tab, "status")}
									className={`w-[176px] font-normal text-[16px] border-[1px] border-solid border-[#EADACA] rounded-[8px] ${
										filters.status === tab ? "bg-[#F8EEE4] text-[#5D5D5D] " : "text-[#8e7777b5]"
									}`}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Button>
							))}
						</div>
					</div>

					<DataTable
						data={events}
						isEventLoading={isEventLoading}
						handleDelete={setIsDeleting}
						handleFilterUpdate={handleFilterUpdate}
						filters={filters}
					/>
				</div>

				{/* Event List */}
				<div className="bg-white rounded-lg overflow-hidden w-full">
					<div className="flex justify-between items-center mb-4">
						<h1 className="font-medium text-[28px]"> Events List</h1>
						<div className="space-x-2">
							{["Live", "unpublished", "past", "cancelled"].map((tab) => (
								<Button
									key={tab}
									variant={filters.status === tab ? "default" : "ghost"}
									onClick={() => handleFilterUpdate(tab, "status")}
									className={`w-[176px] font-normal text-[16px] border-[1px] border-solid border-[#EADACA] rounded-[8px] ${
										filters.status === tab ? "bg-[#F8EEE4] text-[#5D5D5D] " : "text-[#8e7777b5]"
									}`}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Button>
							))}
						</div>
					</div>

					<DataTable
						data={events}
						isEventLoading={isEventLoading}
						handleDelete={setIsDeleting}
						handleFilterUpdate={handleFilterUpdate}
						filters={filters}
					/>
				</div>
			</div>
		</main>
	);
};

export default AdminHomePage;
