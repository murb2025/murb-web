import React from "react";
import { EventListItem } from "./EventCalendar";
import EventSlotDetails from "./EventSlotDetails";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import moment from "moment";
import Image from "next/image";

interface EventListPopoverProps {
	date: Date;
	eventList: EventListItem[];
	selectedEvent: EventListItem | null;
	setSelectedEvent: (event: EventListItem | null) => void;
	showSlots: boolean;
	setShowSlots: (show: boolean) => void;
	refetch: () => void;
}

const EventListPopover: React.FC<EventListPopoverProps> = ({
	date,
	eventList,
	selectedEvent,
	setSelectedEvent,
	showSlots,
	setShowSlots,
	refetch,
}) => {
	const dateStr = moment(date).format("YYYY-MM-DD");

	// console.log("datestr", dateStr, selectedEvent?.eventData.startDate);

	return (
		<div className="p-2 space-y-3 min-w-[300px]">
			<h3 className="text-sm font-medium">{moment(date).format("DD MMM, YYYY")}</h3>
			{eventList.map((item, index) => {
				let isBookingEnabledCnt = 0;
				let slotCnt = 0;
				item.eventData.bookingChart
					?.filter((b) => b.date === dateStr)
					.forEach((b) => {
						isBookingEnabledCnt += b.isBookingEnabled ? 1 : 0;
						slotCnt += b.slot ? 1 : 0;
					});
				const percentageDisabled = (slotCnt - isBookingEnabledCnt) / slotCnt;
				return (
					<Dialog key={index}>
						<DialogTrigger asChild>
							<Card
								key={index}
								className="hover:bg-accent/50 cursor-pointer transition-colors"
								onClick={() => {
									setSelectedEvent(item);
									setShowSlots(true);
								}}
							>
								<CardContent className="flex items-center gap-4 p-4">
									<div className="relative h-full w-20 rounded-lg aspect-video overflow-hidden">
										<Image
											src={Array.isArray(item.eventData?.images) ? item.eventData?.images[0] : ""}
											alt={"Event"}
											fill
											className="object-contain"
										/>
									</div>
									<div className="flex-1">
										<div className="flex justify-between items-start">
											<h4 className="font-semibold text-sm">{item.title}</h4>
											<span className="text-xs text-muted-foreground">{slotCnt} slots</span>
										</div>
										<p className="text-xs grid gap-2 text-muted-foreground mt-1">
											{percentageDisabled}% of slots are disabled
										</p>
									</div>
								</CardContent>
							</Card>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px] p-0">
							<DialogHeader className="p-4 pb-0 border-b">
								<DialogTitle className="flex items-center gap-2">
									{/* <CalendarIcon className="h-5 w-5 text-primary" /> */}
									{moment(date).format("DD MMM, YYYY")}
								</DialogTitle>
								<EventSlotDetails selectedEvent={item} dateStr={dateStr} refetch={refetch} />
							</DialogHeader>
						</DialogContent>
					</Dialog>
				);
			})}
		</div>
	);
};

export default EventListPopover;
