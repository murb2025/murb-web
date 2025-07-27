"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { MembersModal } from "../common/MembersModal";
import moment from "moment";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { PaymentStatus } from "@prisma/client";

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
		avatarUrl: string;
		name: string;
		email: string;
		eventName: string;
		numberOfTickets: string;
		totalPrice: string;
		members: any[];
		dateOfBooking: string;
		status: string;
	}[];
	isEventLoading: boolean;
	currentPage?: number;
}

export const BuyerDetailTable = ({ data, isEventLoading, currentPage }: DataTableProps) => {
	const tableHeaders = [
		"S.No",
		"User",
		"Date of Booking",
		"Event Name",
		"Booked Tickets",
		"Amount",
		"Status",
		"Action",
	];

	return (
		<>
			<Table className="text-base">
				<TableHeader>
					<TableRow className="!rounded-lg">
						{tableHeaders.map((header, idx: number) => (
							<TableHead className="text-center whitespace-nowrap" key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="">
					{!isEventLoading && data && data.length > 0 ? (
						data.map((item, index: number) => {
							return (
								<TableRow key={index}>
									<TableCell className="text-center">{index + 1 + (currentPage || 0) * 10}</TableCell>
									<TableCell>
										<div className="flex flex-row items-center gap-2">
											<Avatar>
												<AvatarImage
													src={item.avatarUrl || "/placeholder.svg"}
													alt={item.email || ""}
												/>
												<AvatarFallback>{item?.email?.charAt(0).toUpperCase()}</AvatarFallback>
											</Avatar>
											<div className="">
												<p className="font-medium text-left capitalize">{item.name}</p>
												<p className="text-sm text-gray-500">{item.email}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="text-center flex flex-col gap-1">
										<span className="text-sm">
											{moment(item.dateOfBooking).format("DD, MMM YYYY")}
										</span>
										<span className="text-sm">{moment(item.dateOfBooking).format("hh:mm a")}</span>
									</TableCell>
									<TableCell className="capitalize text-center">{item.eventName}</TableCell>
									<TableCell className="text-center">{item.numberOfTickets}</TableCell>
									<TableCell className="text-center">₹ {item.totalPrice}</TableCell>
									<TableCell className="text-center">
										{item.status === PaymentStatus.SUCCESS ? (
											<Badge variant="default" className="bg-green-500 text-white">
												{item.status}
											</Badge>
										) : item.status === PaymentStatus.PENDING ? (
											<Badge variant="secondary" className="bg-yellow-500 text-white">
												{item.status}
											</Badge>
										) : (
											<Badge variant="destructive" className="bg-red-500 text-white">
												{item.status}
											</Badge>
										)}
									</TableCell>
									<TableCell className="text-center">
										<MembersModal members={(item.members as any) || []} />
									</TableCell>
								</TableRow>
							);
						})
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
