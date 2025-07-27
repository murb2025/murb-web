"use client";
import { IUser } from "@/types/user.type";
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
import EventSection from "@/components/common/EventSection";
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange";
import { EventDetailTable } from "@/components/common/EventDetailTable";
import AdminPackagePaymentHistoryTable from "@/components/admin/Pakages/AdminPackagePaymentHistory";

// Update your filters interface (keep as is)
interface EventFilters {
	title: string;
	eventType: string;
	status: string;
	startDate: string;
	endDate: string;
	page: number;
	limit: number;
}

const getStatusBgColor = (status: string) => {
	switch (status) {
		case "pending":
			return "bg-[#ffca92]";
		case "unpublished":
			return "bg-[#CFCECE]";
		case "published":
			return "bg-[#D1FDDD]";
	}
};

const getStatusTextColor = (status: string) => {
	switch (status) {
		case "pending":
			return "text-[#e09443]";
		case "unpublished":
			return "text-[#6F6F6F]";
		case "published":
			return "text-[#34A853]";
	}
};

const BannerPage = () => {
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: undefined,
		to: undefined,
	});
	const [tab, setTab] = useState("grid");

	const [filters, setFilters] = useState<EventFilters>({
		title: "",
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
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isLoading: isEventLoading,
	} = trpc.promotion.getPromotedEvents.useInfiniteQuery(
		{
			limit: filters?.limit,
			title: filters?.title || undefined,
			featured: filters?.status === "featured" ? true : filters?.status === "unfeatured" ? false : undefined,
		},
		{
			getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
			keepPreviousData: false,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.data);
	}, [eventsData]);

	return (
		<main className="flex-1 overflow-auto">
			<div className="bg-white rounded-lg">
				<div className="flex flex-row items-center justify-between mb-3">
					<h2 className="text-black text-2xl font-medium">Banner Listings</h2>
				</div>

				<div className="w-full px-3 flex md:flex-row flex-col justify-between items-center mb-[30px]">
					<div className="w-full flex md:flex-row flex-col gap-4">
						<div className="flex flex-row items-center justify-between w-full px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
							<input
								placeholder="Search"
								className="bg-none w-full outline-none max-h-[26px] text-sm placeholder:text-sm placeholder:text-black"
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
									<SelectItem value="featured">Banner</SelectItem>
									<SelectItem value="unfeatured">Not on Banner</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="bg-white rounded-lg overflow-hidden w-full">
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
						type="BANNER"
						backButton={false}
						hasMore={hasNextPage}
						next={fetchNextPage}
						isFetching={isFetchingNextPage}
					/>
				</div>

				<div className="mt-8">
					<h3 className="text-black text-2xl font-medium mb-4">Payment History</h3>
					<AdminPackagePaymentHistoryTable />
				</div>
			</div>
		</main>
	);
};

export default BannerPage;
