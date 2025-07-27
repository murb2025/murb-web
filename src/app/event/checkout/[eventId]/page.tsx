"use client";
import { trpc } from "@/app/provider";
import Helper from "@/components/Buyer/Checkout/Helper";
import NothingFound from "@/components/NothingFound";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import Script from "next/script";

export default function CheckoutPage({ params }: { params: { eventId: string } }) {
	const { data: eventData, isLoading: isEventLoading } = trpc.event.getEventById.useQuery({
		eventId: params.eventId,
	});

	const event = eventData?.event;

	if (isEventLoading) {
		return (
			<div className="min-h-screen grid place-content-center">
				<Loader className="animate-spin" />
			</div>
		);
	}

	if (!event || event.status !== "PUBLISHED") {
		return notFound();
	}

	return (
		<>
			<Script type="text/javascript" src="https://checkout.razorpay.com/v1/checkout.js" />

			<Helper eventData={(event as any) || {}} />
		</>
	);
}
