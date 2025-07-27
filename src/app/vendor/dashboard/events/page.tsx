"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import { IoGridOutline } from "react-icons/io5";
import { IoIosList } from "react-icons/io";
import toast from "react-hot-toast";
import { trpc } from "@/app/provider";
import { useSession } from "next-auth/react";
import { EventDetailTable } from "@/components/common/EventDetailTable";
import EventSection from "@/components/common/EventSection";

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
	const router = useRouter();
	const { data: session } = useSession();
	const user = session?.user;
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

	const handleFilterUpdate = (value: string | number, key: string) => {
		setFilters((prevState) => ({
			...prevState,
			[key]: value,
		}));
	};

	const {
		data: eventsData,
		isLoading: isEventLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.event.getVendorEvents.useInfiniteQuery(
		{
			limit: filters?.limit,
			title: filters?.title || undefined,
			status:
				filters?.status === "all"
					? undefined
					: (filters?.status?.toUpperCase() as "PENDING" | "PUBLISHED" | "UNPUBLISHED"),
		},
		{
			enabled: !!user,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			staleTime: 5 * 60 * 1000,
			cacheTime: 10 * 60 * 1000,
			keepPreviousData: false,
		},
	);

	const handleDeleteEvent = async (id: number) => {
		try {
			// const res = await deleteEvent(id);
			// if (res?.statusCode === 200) {
			// 	toast.success("Event deleted successfully");
			// }
		} catch (err) {
			toast.error("Error deleting event");
		}
	};

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.events);
	}, [eventsData]);

	return (
		<main className="flex-1 overflow-auto space-y-4">
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-black text-2xl font-medium">Listings</h2>
				<Button
					onClick={() => {
						router.push("/event/create");
					}}
				>
					Create Event
				</Button>
			</div>

			<div className="w-full flex flex-row justify-end items-end md:justify-between">
				<div className="w-full flex md:flex-row flex-col gap-4">
					<div className="flex flex-row items-center justify-between md:w-[350px] px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
						<input
							placeholder="Search"
							className="bg-none w-full outline-none max-h-8 text-base placeholder:text-black"
							value={filters?.title}
							onChange={(e) => handleFilterUpdate(e?.target?.value, "title")}
						/>
						<IoSearch className="text-[#828282]" />
					</div>

					<Select value={filters?.status} onValueChange={(value: any) => handleFilterUpdate(value, "status")}>
						<SelectTrigger className="w-full md:w-[180px] text-base">
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
				</div>

				<div className="hidden md:flex flex-row mt-4 md:mt-0 gap-2 p-1.5 border-[1px] border-[#C3996B] rounded-full w-fit h-fit">
					<div
						className={`p-1.5 ${tab === "grid" ? "bg-[#F8EEE4]" : ""} rounded-full cursor-pointer h-fit w-fit`}
						onClick={() => setTab("grid")}
					>
						<IoGridOutline className="text-[#C3996B]" />
					</div>
					<div
						className={`p-1.5 ${tab === "list" ? "bg-[#F8EEE4]" : ""} rounded-full cursor-pointer h-fit w-fit`}
						onClick={() => setTab("list")}
					>
						<IoIosList className="text-[#C3996B]" />
					</div>
				</div>
			</div>

			<div className="bg-background rounded-lg overflow-hidden w-full">
				{tab === "list" ? (
					<EventDetailTable data={processedEvents as any} isEventLoading={isEventLoading} />
				) : (
					<>
						<h2 className="text-black text-lg font-medium">
							{filters?.status === "all"
								? "All"
								: filters?.status?.charAt(0)?.toUpperCase() + filters?.status?.slice(1)}{" "}
							Listings
						</h2>
						<div className="px-4">
							<EventSection
								processedEvents={processedEvents as any}
								isEventLoading={isEventLoading}
								type="VENDOR"
								backButton={false}
								listAll={true}
								hasMore={hasNextPage}
								next={fetchNextPage}
								isFetching={isFetchingNextPage}
							/>
						</div>
					</>
				)}
			</div>
		</main>
	);
};

export default Events;
