"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";

import { LoadingSpinner } from "@/components/ui/loader";

import EventCard from "@/components/common/EventCard";

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

// const getStatusBgColor = (status: string) => {
// 	switch (status) {
// 		case "pending":
// 			return "bg-[#ffca92]";
// 		case "unpublished":
// 			return "bg-[#CFCECE]";
// 		case "published":
// 			return "bg-[#D1FDDD]";
// 	}
// };

// const getStatusTextColor = (status: string) => {
// 	switch (status) {
// 		case "pending":
// 			return "text-[#e09443]";
// 		case "unpublished":
// 			return "text-[#6F6F6F]";
// 		case "published":
// 			return "text-[#34A853]";
// 	}
// };

// const getStatusText = (status: string) => {
// 	switch (status) {
// 		case "pending":
// 			return "Pending";
// 		case "unpublished":
// 			return "Unpublished";
// 		case "published":
// 			return "Live";
// 	}
// };

// const getCardButton = (status: string) => {
// 	switch (status) {
// 		case "pending":
// 			return (
// 				<Button disabled className="bg-black text-white opacity-70">
// 					Promote
// 				</Button>
// 			);
// 		case "unpublished":
// 			return <Button className="bg-black text-white">Publish</Button>;
// 		case "published":
// 			return <Button className="bg-black text-white">Promote</Button>;
// 	}
// };

export default function GridView({
	data,
	isEventLoading,
}: {
	data: any;
	isEventLoading: boolean;
	handleFilterUpdate: (value: string | number, key: string) => void;
	filters: EventFilters;
}) {
	const [showAll, setShowAll] = React.useState(false);

	if (isEventLoading) {
		return (
			<div className="flex flex-row justify-center mt-10 w-full">
				<LoadingSpinner className="text-black w-10 h-10" />
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="flex flex-row justify-center w-full">
				<div className="text-center mt-10 w-full">No data found</div>
			</div>
		);
	}

	const displayedData = showAll ? data : data.slice(0, 4);

	const formatLocation = (location: any) => {
		if (!location) return "Location TBD";
		if (typeof location === "string") return location;

		const parts = [];
		if (location.address) parts.push(location.address);
		if (location.landmark) parts.push(location.landmark);
		if (location.pincode) parts.push(location.pincode);

		return parts.join(", ") || "Location TBD";
	};

	return (
		<div className="flex flex-col items-center mb-8">
			<div className="flex flex-row gap-10 flex-wrap">
				{displayedData.map((item: any, index: number) => (
					<EventCard
						key={index}
						promotion={true}
						{...item}
						location={formatLocation(item.location)}
						type="VENDOR"
						seatsLeft={item?.totalParticipants ? item.totalParticipants : item.maximumParticipants}
						time={
							item.eventSpecificType === "VENUE"
								? `${item?.startingTime || ""} - ${item?.endingTime || ""}`
								: item?.startingTime || ""
						}
						title={item.title || `Venue-${item.tags} `}
						date={
							item.startDate
								? new Date(item.startDate)
										.toLocaleDateString("en-GB", {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
										})
										.replace(/\//g, "-")
								: item.weekDays?.join(", ")
						}
						status={item?.status?.toUpperCase() || "PENDING"}
						category={item?.eventType || item.sportName}
						price={item?.price || "1000"}
					/>
				))}
			</div>
			{data.length > 4 && (
				<Button className="mt-6 bg-[#C3996B] text-white max-h-[40px]" onClick={() => setShowAll(!showAll)}>
					{showAll ? "Show Less" : "View All"}
				</Button>
			)}
		</div>
	);
}
