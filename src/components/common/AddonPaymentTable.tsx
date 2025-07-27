"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { MembersModal } from "../common/MembersModal";
import moment from "moment";
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

interface DataTableProps {
	data: {
		id: string;
		vendorId: string;
		vendorName: string;
		avatarUrl: string;
		email: string;
		eventName: string;
		amount: string;
		date: string;
		paymentId: string;
		addonDetail: string;
	}[];
	isEventLoading: boolean;
	currentPage?: number;
}

export const AddonPaymentTable = ({ data, isEventLoading, currentPage }: DataTableProps) => {
	const tableHeaders = ["S.No", "Host", "Service Title", "Event", "Date", "Amount", "Payment Id"];

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead className={" text-center whitespace-nowrap"} key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-[#FDFDFD]">
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item, index: number) => {
							return (
								<TableRow key={index}>
									<TableCell className="text-center">{index + 1 + (currentPage || 0) * 10}</TableCell>
									<TableCell className="whitespace-nowrap">
										<div className="flex flex-row items-center gap-2">
											<Avatar>
												<AvatarImage src={item.avatarUrl} alt={item.email || ""} />
												<AvatarFallback>{item?.email?.charAt(0).toUpperCase()}</AvatarFallback>
											</Avatar>
											<div className="">
												<p className="font-medium text-left capitalize">{item.vendorName}</p>
												<p className="text-sm text-gray-500">{item.email}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="whitespace-nowrap">{item.addonDetail}</TableCell>
									<TableCell className="whitespace-nowrap text-center">{item.eventName}</TableCell>
									<TableCell className="whitespace-nowrap text-center">
										{moment(item.date).format("DD, MMM YYYY hh:mm a")}
									</TableCell>
									<TableCell className="text-center">₹ {item.amount}</TableCell>
									<TableCell className="text-center">{item.paymentId}</TableCell>
								</TableRow>
							);
						})}
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
