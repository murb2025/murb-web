import TicketDetails from "@/components/Buyer/Ticket/TicketDetails";
import React from "react";

export default function TicketPage({ params }: { params: { bookingId: string } }) {
	return (
		<>
			<TicketDetails bookingId={params.bookingId} />
		</>
	);
}
