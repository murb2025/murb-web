"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { IoGridOutline } from "react-icons/io5";
import { IoIosList } from "react-icons/io";
import toast from "react-hot-toast";
import { trpc } from "@/app/provider";
import Promotions from "@/components/Dashboard/Promotions";
import EventSection from "@/components/common/EventSection";
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange";
import { EventDetailTable } from "@/components/common/EventDetailTable";

// Update your filters interface (keep as is)
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

const Events = () => {
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: undefined,
		to: undefined,
	});
	const [tab, setTab] = useState("grid");

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

	useEffect(() => {
		if (date?.from && date.to) {
			setFilters({
				...filters,
				startDate: date.from.toISOString(),
				endDate: date.to.toISOString(),
			});
		} else {
			setFilters({
				...filters,
				startDate: "",
				endDate: "",
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [date?.from, date?.to]);

	const handleFilterUpdate = (value: string | number, key: string) => {
		setFilters((prevState) => ({
			...prevState,
			[key]: value,
		}));
	};

	const {
		data: eventsData,
		isLoading: isEventLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = trpc.admin.getEvents.useInfiniteQuery(
		{
			limit: filters?.limit,
			title: filters?.title || undefined,
			status:
				filters?.status === "all"
					? undefined
					: (filters?.status?.toUpperCase() as "PENDING" | "PUBLISHED" | "UNPUBLISHED"),
			from: filters?.startDate as any,
			to: filters?.endDate as any,
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
		return eventsData.pages.flatMap((page) => page.events);
	}, [eventsData]);

	return (
		<main className="flex-1 overflow-auto">
			<div className="bg-white rounded-lg">
				<div className="flex flex-row items-center justify-between mb-3">
					<h2 className="text-black text-3xl font-medium">Listings</h2>
				</div>

				<div className="w-full flex md:flex-row flex-col justify-between items-center mb-[30px]">
					<div className="w-full px-2 md:px-0 flex md:flex-row flex-col gap-4">
						<div className="flex flex-row items-center justify-between w-full px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
							<input
								placeholder="Search"
								className="bg-none w-full outline-none max-h-[26px] text-[12px] placeholder:text-[12px] placeholder:text-black"
								value={filters?.title}
								onChange={(e) => handleFilterUpdate(e?.target?.value, "title")}
							/>
							<IoSearch className="text-[#828282]" size={24} />
						</div>

						<Select
							value={filters?.status}
							onValueChange={(value: any) => handleFilterUpdate(value, "status")}
						>
							<SelectTrigger className="w-full md:w-[150px]">
								<SelectValue placeholder="Listings" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Listings</SelectLabel>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="published">Published</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="unpublished">Unpublished</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>

						<div className="flex w-full items-center gap-2">
							<DatePickerWithRange setDate={setDate} date={date} />
							{
								<Button variant="outline" onClick={() => setDate({ from: undefined, to: undefined })}>
									Clear
								</Button>
							}
						</div>
					</div>

					<div className="hidden md:flex flex-row gap-2 p-1.5 border-[1px] border-[#C3996B] rounded-full w-fit h-fit">
						<div
							className={`p-2.5 ${tab === "grid" ? "bg-[#F8EEE4]" : ""} rounded-full cursor-pointer h-fit w-fit`}
							onClick={() => setTab("grid")}
						>
							<IoGridOutline size={24} className="text-[#C3996B]" />
						</div>
						<div
							className={`p-2.5 ${tab === "list" ? "bg-[#F8EEE4]" : ""} rounded-full cursor-pointer h-fit w-fit`}
							onClick={() => setTab("list")}
						>
							<IoIosList size={24} className="text-[#C3996B]" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg overflow-hidden w-full">
					{tab === "list" ? (
						<EventDetailTable data={processedEvents as any} isEventLoading={isEventLoading} />
					) : (
						<>
							<h2 className="text-black text-[18px] font-medium">
								{filters?.status === "all"
									? "All"
									: filters?.status?.charAt(0)?.toUpperCase() + filters?.status?.slice(1)}{" "}
								Listings
							</h2>
							<EventSection
								processedEvents={processedEvents as any}
								isEventLoading={isEventLoading}
								listAll={true}
								type="ADMIN"
								backButton={false}
								hasMore={hasNextPage}
								next={fetchNextPage}
								isFetching={isFetchingNextPage}
							/>
						</>
					)}
				</div>
			</div>
		</main>
	);
};

export default Events;
