import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/app/provider";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AddonPaymentList() {
	const { data: paymentHistory, isLoading } = trpc.promotion.getAddonPayments.useQuery({
		isUserSpecific: true,
		page: 1,
		limit: 10,
	});

	const getStatusBadge = (status: string) => {
		const statusColors = {
			PENDING: "bg-yellow-100 text-yellow-800",
			SUCCESS: "bg-green-100 text-green-800",
			FAILED: "bg-red-100 text-red-800",
		};
		return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
	};

	if (isLoading) {
		return <div className="text-center py-4">Loading payment history...</div>;
	}

	if (!paymentHistory?.data?.length) {
		return <div className="text-center py-4">No payment history found</div>;
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="whitespace-nowrap">S. No.</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Package Name</TableHead>
						<TableHead>Event</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Payment ID</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{paymentHistory.data.map((payment, idx) => (
						<TableRow key={payment.id}>
							<TableCell>{idx + 1}</TableCell>
							<TableCell className="whitespace-nowrap">
								{format(new Date(payment.date), "dd MMM yyyy HH:mm a")}
							</TableCell>
							<TableCell className="whitespace-nowrap">{payment.addonDetail}</TableCell>
							<TableCell className="whitespace-nowrap">{payment.eventName}</TableCell>
							<TableCell>₹ {payment.amount}</TableCell>
							<TableCell>
								<Badge className={getStatusBadge(payment.status)}>{payment.status}</Badge>
							</TableCell>
							<TableCell>{payment.paymentId}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</>
	);
}
