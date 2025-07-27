import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/app/provider";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { IoSearch } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminPackagePaymentHistoryTable() {
	const [searchText, setSearchText] = useState("");
	const { data: paymentHistory, isLoading } = trpc.promotion.getPackagePayments.useQuery({
		page: 1,
		limit: 10000,
		title: searchText,
	});

	const getStatusBadge = (status: string) => {
		const statusColors = {
			PENDING: "bg-yellow-100 text-yellow-800",
			SUCCESS: "bg-green-100 text-green-800",
			FAILED: "bg-red-100 text-red-800",
		};
		return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
	};

	return (
		<div>
			<div className="flex-1 flex flex-row items-center my-4 justify-between px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
				<input
					placeholder="Search"
					className="bg-none w-full outline-none max-h-[26px] text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:text-black"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
				<IoSearch className="text-[#828282]" size={24} />
			</div>
			{!isLoading ? (
				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="whitespace-nowrap">#</TableHead>
								<TableHead className="whitespace-nowrap">Host</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="whitespace-nowrap">Package Name</TableHead>
								<TableHead>Event</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Payment ID</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paymentHistory?.data?.length ? (
								paymentHistory.data.map((payment, idx) => (
									<TableRow key={payment.id}>
										<TableCell className="whitespace-nowrap text-center">{idx + 1}</TableCell>
										<TableCell className="whitespace-nowrap">
											<div className="flex flex-row items-center gap-2">
												<Avatar>
													<AvatarImage
														src={payment.avatarUrl || "/placeholder.svg"}
														alt={payment.email || ""}
													/>
													<AvatarFallback>
														{payment?.email?.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="">
													<p className="font-medium text-left capitalize">
														{payment.vendorName}
													</p>
													<p className="text-sm text-gray-500">{payment.email}</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="whitespace-nowrap">
											{format(new Date(payment.date), "dd MMM yyyy HH:mm a")}
										</TableCell>
										<TableCell className="whitespace-nowrap">{payment.packageDetail}</TableCell>
										<TableCell className="whitespace-nowrap">{payment.eventName}</TableCell>
										<TableCell>₹ {payment.amount}</TableCell>
										<TableCell>
											<Badge className={getStatusBadge(payment.status)}>{payment.status}</Badge>
										</TableCell>
										<TableCell className="font-mono">{payment.paymentId}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} className="font-mono">
										<div className="text-center py-4">No payment history found</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="text-center py-4">Loading payment history...</div>
			)}
		</div>
	);
}
