"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { PackageCard } from "@/components/Dashboard/Promotions/PackageCard";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import EventSection from "@/components/common/EventSection";
import useQuery from "@/hooks/useQuery";
import Script from "next/script";
import PaymentHistoryTable from "@/components/Dashboard/Promotions/PaymentHistoryTable";
import { useSession } from "next-auth/react";

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

export default function Promotions() {
	const router = useRouter();
	const { getQuery } = useQuery();
	const eventSection = getQuery("view");

	const [filters, setFilters] = useState<EventFilters>({
		title: "",
		categoryId: 0,
		subCategoryId: 0,
		eventType: "",
		status: "featured",
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
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = trpc.promotion.getPromotedEvents.useInfiniteQuery(
		{
			isVendorSpecific: true,
			limit: filters?.limit,
			title: filters?.title || undefined,
			featured: filters?.status === "featured" ? true : filters?.status === "unfeatured" ? false : undefined,
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
		return eventsData.pages.flatMap((page) => page.data);
	}, [eventsData]);

	const { data: packagesData, isLoading: isPackagesLoading } = trpc.promotion.getPromotionPackages.useQuery(
		{
			page: 1,
			limit: 10,
			sortBy: "packagePrice",
			sortOrder: "asc",
		},
		{
			onError: (error) => {
				toast.error("Failed to load promotion packages");
				console.error("Error loading packages:", error);
			},
		},
	);

	return (
		<>
			<Script type="text/javascript" src="https://checkout.razorpay.com/v1/checkout.js" />

			<main className="flex-1 overflow-auto space-y-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<h2 className="text-black text-2xl font-medium">Promotions</h2>
					{/* <Button
						onClick={() => {
							router.push("/event/create");
						}}
					>
						Create Event
					</Button> */}
				</div>

				<div className="w-full flex flex-col gap-4">
					<div className="w-full flex flex-col sm:flex-row gap-4">
						<div className="flex-1 flex flex-row items-center justify-between px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
							<input
								placeholder="Search"
								className="bg-none w-full outline-none max-h-[26px] text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:text-black"
								value={filters?.title}
								onChange={(e) => handleFilterUpdate(e?.target?.value, "title")}
							/>
							<IoSearch className="text-[#828282]" size={24} />
						</div>

						<Select
							value={filters?.status}
							defaultValue="all"
							onValueChange={(value: any) => handleFilterUpdate(value, "status")}
						>
							<SelectTrigger className="w-full md:w-[250px]">
								<SelectValue placeholder="Select Featured" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Listings</SelectLabel>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="featured">Featured</SelectItem>
									<SelectItem value="unfeatured">UnFeatured</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Events List */}
				<div className="flex flex-col justify-center rounded-lg overflow-hidden w-full">
					<h2 className="text-black text-xl font-medium mb-4 text-left">
						{filters?.status === "all"
							? "All"
							: filters?.status?.charAt(0)?.toUpperCase() + filters?.status?.slice(1)}{" "}
						Listings
					</h2>
					<EventSection
						processedEvents={processedEvents as any}
						isEventLoading={isEventLoading}
						listAll={eventSection === "all"}
						type="PROMOTION"
						backButton={false}
						hasMore={hasNextPage}
						next={fetchNextPage}
						isFetching={isFetchingNextPage}
					/>
				</div>

				{/* Packages */}
				<h3 className="text-black text-xl font-medium">Packages</h3>
				<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{isPackagesLoading ? (
						<div className="col-span-full text-center">Loading packages...</div>
					) : packagesData && packagesData?.data.length > 0 ? (
						packagesData?.data.map((item, idx) => (
							<PackageCard
								key={idx}
								id={item.id}
								title={item.packageName}
								price={item.packagePrice as any}
								description={(item.packageDescription as any) || []}
							/>
						))
					) : (
						<div className="col-span-full text-center">No packages available</div>
					)}
				</section>

				{/* Payment History */}
				<div>
					<h3 className="text-black text-2xl font-medium mb-4">Payment History</h3>
					<PaymentHistoryTable />
				</div>
			</main>
		</>
	);
}
