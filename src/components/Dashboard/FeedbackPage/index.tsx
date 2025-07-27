"use client";
import React, { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { trpc } from "@/app/provider";

export default function FeedbackPage() {
	const [filters, setFilters] = useState<{
		page: number;
		limit: number;
		sortBy: "createdAt" | "rating";
		sortOrder: "asc" | "desc";
		eventId: string;
	}>({
		page: 1,
		limit: 10,
		sortBy: "createdAt",
		sortOrder: "desc",
		eventId: "",
	});

	const [filter, setFilter] = useState<"NEWEST" | "HIGHEST" | "LOWEST" | "">("");
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);

	const tableHeaders = ["#", "User", "Event", "Feedback", "Rating", "Date", "Actions"];

	const { data: publishedEvents } = trpc.feedback.getPublishedEvents.useQuery({
		vendorSpecific: true,
	});

	const { data: feedbackData, isLoading: isFeedbackLoading } = trpc.feedback.getFeedbacks.useQuery({
		page,
		limit: size,
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
		eventId: filters.eventId,
		isVendorSpecific: true,
	});

	const handleFilterChange = (newFilter: "NEWEST" | "HIGHEST" | "LOWEST") => {
		setFilter((prev) => (prev === newFilter ? "" : newFilter));
		setPage(1);
		switch (newFilter) {
			case "HIGHEST":
				setFilters((prev) => ({
					...prev,
					sortBy: "rating",
					sortOrder: "desc",
				}));
				break;
			case "NEWEST":
				setFilters((prev) => ({
					...prev,
					sortBy: "createdAt",
					sortOrder: "desc",
				}));
				break;
			case "LOWEST":
				setFilters((prev) => ({
					...prev,
					sortBy: "rating",
					sortOrder: "asc",
				}));
				break;

			default:
				break;
		}
	};

	const handleEventChange = (eventId: string) => {
		setFilters((prev) => ({ ...prev, eventId: eventId === "all" ? "" : eventId }));
		setPage(1);
	};

	return (
		<div className="w-full mx-auto space-y-4">
			<h1 className="text-2xl font-medium">Feedbacks</h1>
			<section className="flex md:flex-row justify-between flex-col gap-4">
				<div className="w-full sm:max-w-md lg:max-w-lg">
					<Select onValueChange={handleEventChange} value={filters.eventId || "all"}>
						<SelectTrigger className="w-full text-sm sm:text-base">
							<SelectValue placeholder="Select Event" />
						</SelectTrigger>
						<SelectContent className="max-h-[50vh] overflow-y-auto">
							<SelectItem value="all">All Events</SelectItem>
							{publishedEvents?.data.map((event) => (
								<SelectItem key={event.id} value={event.id}>
									{event.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-x-2">
					<Badge
						variant="outline"
						className={`cursor-pointer text-[#6F6F6F] text-xs sm:text-sm font-medium border-none shadow-md shadow-[#EDE0D1] hover:scale-105 transition-all ease-in-out duration-300 hover:bg-[#E5D3BA] ${
							filter === "NEWEST" ? "bg-[#E5D3BA]" : ""
						}`}
						onClick={() => handleFilterChange("NEWEST")}
					>
						Newest
					</Badge>
					<Badge
						variant="outline"
						className={`cursor-pointer text-[#6F6F6F] text-xs sm:text-sm font-medium border-none shadow-md shadow-[#EDE0D1] hover:scale-105 transition-all ease-in-out duration-300 hover:bg-[#E5D3BA] ${
							filter === "HIGHEST" ? "bg-[#E5D3BA]" : ""
						}`}
						onClick={() => handleFilterChange("HIGHEST")}
					>
						Highest
					</Badge>
					<Badge
						variant="outline"
						className={`cursor-pointer text-[#6F6F6F] text-xs sm:text-sm font-medium border-none shadow-md shadow-[#EDE0D1] hover:scale-105 transition-all ease-in-out duration-300 hover:bg-[#E5D3BA] ${
							filter === "LOWEST" ? "bg-[#E5D3BA]" : ""
						}`}
						onClick={() => handleFilterChange("LOWEST")}
					>
						Lowest
					</Badge>
				</div>
			</section>
			<div className="overflow-x-auto">
				<DataTable
					data={(feedbackData?.data.reviews as any) || []}
					isLoading={isFeedbackLoading}
					tableHeaders={tableHeaders}
					setPage={setPage}
					page={page}
					totalPages={feedbackData?.data.pagination.pages ?? 1}
				/>
			</div>
		</div>
	);
}
