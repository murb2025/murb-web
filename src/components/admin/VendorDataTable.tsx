"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { Button } from "../ui";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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

export const VendorDataTable = ({
	data,
	isEventLoading,
	filters,
}: {
	data: {
		name: string;
		email: string;
		avatarUrl: string;
		totalTickets: number;
		totalRevenue: number;
		totalListing: number;
		id: number;
		acountStatus: string;
	}[];
	isEventLoading: boolean;
	handleDelete?: (_: boolean) => void;
	handleFilterUpdate?: (_: string | number, __: string) => void;
	filters?: EventFilters;
}) => {
	const tableHeaders = ["S No.", "Host Name", "Total Listing", "Total Bookings", "Tickets sold", "Status", "Action"];

	return (
		<>
			<Table className="text-base">
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead className={" text-center whitespace-nowrap"} key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item, index: number) => (
							<TableRow key={index}>
								<TableCell className="text-center">{index + 1 + 10 * (filters?.page || 0)}</TableCell>
								<TableCell className="text-center">
									<div className="flex flex-row items-center gap-2">
										<Avatar>
											<AvatarImage src={item.avatarUrl} alt={item.email || ""} />
											<AvatarFallback>{item?.email?.charAt(0).toUpperCase()}</AvatarFallback>
										</Avatar>
										<div className="">
											<p className="font-medium text-left capitalize">{item.name}</p>
											<p className="text-sm text-gray-500">{item.email}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-center">{item.totalListing}</TableCell>
								<TableCell className="text-center">{item.totalTickets}</TableCell>
								<TableCell className="text-center">₹ {item.totalRevenue}</TableCell>
								<TableCell className="text-center ">
									<span
										className={`${item.acountStatus === "VERIFIED" ? "bg-green-400" : "bg-orange-300"} inline-block rounded-full w-3 h-3`}
									></span>{" "}
									{item.acountStatus}
								</TableCell>
								<TableCell className="text-center decoration-gray-400 underline underline-offset-4">
									<Link href={"/admin/dashboard/vendor/details/" + item.id}>View</Link>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isEventLoading && data.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}
		</>
	);
};
