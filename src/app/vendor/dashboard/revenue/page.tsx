"use client";
import { trpc } from "@/app/provider";
import { ChartComponent } from "@/components/Chart";
import { LoadingSpinner } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface Event {
	id: string;
	title: string;
}

export default function VendorRevenue() {
	const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
	const [selectedEvent, setSelectedEvent] = React.useState<string>("");

	const { data: events } = trpc.event.getPublishedEvents.useQuery<Event[]>();
	const { data: revenueData, isLoading } = trpc.booking.getRevenue.useQuery({
		year: selectedYear,
		isUserSpecific: true,
		eventId: selectedEvent === "All" ? undefined : selectedEvent,
	});

	// console.log(events);

	return (
		<div>
			<section className="mb-4 flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-black text-2xl font-medium">
							Revenue{" "}
							{selectedEvent
								? events?.find((e) => e.id === selectedEvent)
									? " of " + events?.find((e) => e.id === selectedEvent)?.title
									: ""
								: ""}
						</h1>
						<p className="text-sm text-gray-500">Jan - Dec {selectedYear}</p>
						<p className="text-sm text-gray-500">
							{!selectedEvent ? "Showing revenue for all events" : `Showing revenue for selected event`}
						</p>
					</div>
					<section className="gap-4 hidden md:flex">
						<Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select Year" />
							</SelectTrigger>
							<SelectContent>
								{[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
									<SelectItem key={year} value={year.toString()}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={selectedEvent} onValueChange={setSelectedEvent}>
							<SelectTrigger className="w-full md:w-[280px]">
								<SelectValue placeholder="Select Event" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All Events</SelectItem>
								{events?.map((event) => (
									<SelectItem key={event.id} value={event.id}>
										{event.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</section>
				</div>

				<div className="flex justify-between md:hidden flex-col md:flex-row gap-4 items-center">
					<Select value={selectedEvent} onValueChange={setSelectedEvent}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select Event" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="All">All Events</SelectItem>
							{events?.map((event) => (
								<SelectItem key={event.id} value={event.id}>
									{event.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select Year" />
						</SelectTrigger>
						<SelectContent>
							{[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</section>

			{!isLoading ? (
				<ChartComponent chartData={revenueData || []} />
			) : (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
		</div>
	);
}
