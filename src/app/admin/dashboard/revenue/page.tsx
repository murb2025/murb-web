"use client";
import { trpc } from "@/app/provider";
import { ChartComponent } from "@/components/Chart";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loader";

export default function AdminRevenue() {
	const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
	const { data: revenueData, isLoading } = trpc.booking.getRevenue.useQuery({
		year: selectedYear,
	});
	const { data: totalData, isLoading: isLoadingTotal } = trpc.booking.getTotalRevenue.useQuery({
		year: selectedYear,
	});

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<section className=" mb-4 flex justify-between md:flex-row flex-col gap-3">
					<div>
						<h1 className="text-2xl font-medium">Overall</h1>
						<p className="text-sm text-gray-500">Jan - Dec {selectedYear}</p>
					</div>
					<Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
						<SelectTrigger className="w-full md:w-[180px]">
							<SelectValue placeholder="Theme" />
						</SelectTrigger>
						<SelectContent>
							{[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</section>
				{!isLoadingTotal ? (
					<ChartComponent chartData={totalData || []} />
				) : (
					<div className="flex flex-row justify-center mt-10 w-full">
						<LoadingSpinner className="text-black w-10 h-10" />
					</div>
				)}
			</div>
			<div>
				<section className=" mb-4 flex justify-between md:flex-row flex-col gap-3">
					<div>
						<h1 className="text-2xl font-medium">All Revenue</h1>
						<p className="text-sm text-gray-500">Jan - Dec {selectedYear}</p>
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
		</div>
	);
}
