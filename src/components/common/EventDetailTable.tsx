"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { IEvent } from "@/types/event.type";
import moment from "moment";
import { useRouter } from "next/navigation";
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

export const EventDetailTable = ({ data, isEventLoading }: { data: Partial<IEvent>[]; isEventLoading: boolean }) => {
	const tableHeaders = ["S.No", "Title", "Location", "Date", "Time", "Event Type"];
	const router = useRouter();
	const formatLocation = (location: any) => {
		if (!location) return "Location TBD";
		if (typeof location === "string") return location;

		const parts = [];
		if (location.address) parts.push(location.address);
		if (location.landmark) parts.push(location.landmark);
		if (location.pincode) parts.push(location.pincode);

		return parts.join(", ") || "Location TBD";
	};

	const formatTime = (timeString: string | undefined) => {
		if (!timeString || typeof timeString !== "string") return "TBD";

		// If time contains a hyphen, it's a time range
		if (timeString.includes("-")) {
			const [start, end] = timeString.split("-").map((t) => t.trim());

			try {
				const startDate = new Date(start);
				const endDate = new Date(end);

				// Check if dates are valid
				if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
					return timeString; // Return original string if dates are invalid
				}

				return `${startDate.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				})} - ${endDate.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				})}`;
			} catch (error) {
				return timeString; // Return original string if parsing fails
			}
		}

		// Single time
		try {
			const date = new Date(timeString);

			// Check if date is valid
			if (isNaN(date.getTime())) {
				return timeString; // Return original string if date is invalid
			}

			return date.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});
		} catch (error) {
			return timeString; // Return original string if parsing fails
		}
	};

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header) => (
							<TableHead className="text-center" key={header}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{!isEventLoading && data && data.length > 0 ? (
						data.map((item, index: number) => (
							<TableRow
								key={index}
								className="cursor-pointer"
								onClick={() => router.push(`/event/details/${item.id}`)}
							>
								<TableCell className="text-center">{index + 1}</TableCell>
								<TableCell className="text-center">{item.title || `Venue-${item.tags}`}</TableCell>
								<TableCell className="text-center">{formatLocation(item.location)}</TableCell>
								<TableCell className="text-center">
									{item.multipleDays
										? moment(item.startDate).format("DD MMM,YYYY") +
											" to " +
											moment(item.endDate).format("DD MMM,YYYY")
										: moment(item.startDate).format("DD MMM,YYYY")}
								</TableCell>
								<TableCell className="text-center">
									{formatTime(`${item?.startingTime || ""} - ${item?.endingTime || ""}`)}
								</TableCell>
								<TableCell className="text-center">{item?.eventSpecificType}</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={tableHeaders.length} className="text-center">
								No data found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
		</>
	);
};
