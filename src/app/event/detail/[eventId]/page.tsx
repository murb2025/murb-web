"use client";
import { trpc } from "@/app/provider";
import EventFullDetails from "@/components/common/Event/EventFullDetail";
import { IEvent } from "@/types/event.type";
import { isAdminEmail } from "@/utils/helper";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";

export default function Page({ params }: { params: { eventId: string } }) {
	const { data: session } = useSession();
	const { data: eventData, isLoading: isEventLoading } = trpc.event.getEventById.useQuery({
		eventId: params.eventId,
		includeBookingChart : false
	});

	const event = eventData?.event;

	if (isEventLoading) {
		return (
			<div className="min-h-screen grid place-content-center">
				<Loader className="animate-spin" />
			</div>
		);
	}
	if (!event) {
		return notFound();
	}

	if (
		event?.status !== "PUBLISHED" &&
		session?.user.id !== event?.vendorId &&
		!isAdminEmail(session?.user.email || "")
	) {
		return notFound();
	}

	return <EventFullDetails isBookingPage={true} data={(event as any as IEvent) || []} />;
}
