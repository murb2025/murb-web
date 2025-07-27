"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { formatDate } from "@/utils/date";

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

export default function TableView({
	data,
	isEventLoading,
	filters,
	handleFilterUpdate,
}: {
	data: any;
	isEventLoading: boolean;
	filters: EventFilters;
	handleFilterUpdate: (value: string | number, key: string) => void;
}) {
	const router = useRouter();
	const tableHeaders = ["S No.", "Title", "Location", "Date", "Time", "Days", ""];
	return (
		<>
			<Table>
				<TableHeader className="bg-[#F7F7F7]">
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead
								className={` text-center text-[18px] font-normal py-4 ${idx !== 0 ? "border-l-[1px]" : " "} `}
								key={header}
							>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-[#FDFDFD]">
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item: any, index: number) => (
							<TableRow key={index}>
								<TableCell className=" text-center text-[16px] font-normal text-[#6F6F6F]">
									{/* {item.id} */}
									{index + 1}
									{/* {item.id} */}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									{item.title ? item.title : item.name ? item.name : "Venue"}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									{item.location}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									{formatDate(item.date)}
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									14:00 - 15:30
								</TableCell>
								<TableCell className="border-l-[1px] text-center text-[16px] font-normal text-[#6F6F6F]">
									Single Day
								</TableCell>
								<TableCell className="border-l-[1px]">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="bg-none outline-none border-none">
												<IoEllipsisVerticalSharp size={20} />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="">
											<DropdownMenuItem className="py-1 px-2 border-b-[1px] border-solid ">
												<Button
													variant="outline"
													className="bg-none outline-none border-none w-full"
													onClick={() => router.push(`/dashboard/events/details/${item.id}`)}
												>
													<p className="text-[14px] w-full text-left">View</p>
												</Button>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{data.length > 0 && (
				<div className="py-2 px-2 flex flex-row justify-between items-center mt-6">
					<div className="flex flex-row gap-2 items-center w-[300px]">
						<div>
							<Select onValueChange={(value: any) => handleFilterUpdate(value, "limit")}>
								<SelectTrigger className="text-black">
									<SelectValue placeholder={filters.limit} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="10">10</SelectItem>
									<SelectItem value="20">20</SelectItem>
									<SelectItem value="50">50</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<p className="text-[16px] text-default-400 ">Items per page</p>
					</div>
					<div className="flex flex-row gap-2 items-center">
						<div
							onClick={() => {
								if (filters.page === 1) {
									return;
								}
								handleFilterUpdate(filters.page - 1, "page");
							}}
							className={`p-1 border-[1px] h-fit w-fit  ${filters.page === 1 ? "text-gray-600 opacity-60" : " hover:bg-gray-100 text-black font-bold"} rounded-md cursor-pointer`}
						>
							<ChevronLeftRegular fontSize={20} />
						</div>
						<div
							onClick={() => {
								if (data.length !== filters.limit) {
									return;
								}
								handleFilterUpdate(filters.page + 1, "page");
							}}
							className={`p-1 border-[1px] h-fit w-fit  ${
								data.length !== filters.limit
									? "text-gray-600 opacity-60"
									: " hover:bg-gray-100 text-black font-bold"
							} rounded-md cursor-pointer`}
						>
							<ChevronRightRegular fontSize={20} />
						</div>
					</div>
				</div>
			)}
			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isEventLoading && data.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}
		</>
	);
}
