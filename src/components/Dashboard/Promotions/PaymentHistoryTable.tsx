import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/app/provider";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const tableHeaders = ["S. No.", "Date", "Package Name", "Event", "Amount", "Status", "Payment ID"];

export default function PaymentHistoryTable() {
	const { data: paymentHistory, isLoading } = trpc.promotion.getPackagePayments.useQuery({
		isUserSpecific: true,
		page: 1,
		limit: 10000,
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
		<Table>
			<TableHeader>
				<TableRow>
					{tableHeaders.map((header) => (
						<TableHead className="whitespace-nowrap" key={header}>
							{header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{paymentHistory.data.map((payment, idx) => (
					<TableRow key={payment.id}>
						<TableCell>{idx + 1}</TableCell>
						<TableCell className="whitespace-nowrap">
							{format(new Date(payment.date), "dd MMM yyyy HH:mm a")}
						</TableCell>
						<TableCell className="whitespace-nowrap">{payment.packageDetail}</TableCell>
						<TableCell className="whitespace-nowrap">{payment.eventName}</TableCell>
						<TableCell className="whitespace-nowrap">₹ {payment.amount}</TableCell>
						<TableCell>
							<Badge className={getStatusBadge(payment.status)}>{payment.status}</Badge>
						</TableCell>
						<TableCell className="font-mono">{payment.paymentId}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
