import React from "react";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { EventListItem } from "./EventCalendar";
import SwitchOnOff from "./SwitchOnOff";
import { cn } from "@/lib/utils";

interface EventSlotDetailsProps {
	selectedEvent: EventListItem;
	dateStr: string;
	refetch: () => void;
}

const EventSlotDetails: React.FC<EventSlotDetailsProps> = ({ selectedEvent, dateStr, refetch }) => {
	return (
		<div className="py-4 max-h-96 space-y-4 overflow-y-auto">
			<div className="relative z-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 items-start space-x-4">
					<div>
						{selectedEvent.eventData.images && selectedEvent.eventData.images.length > 0 && (
							<img
								src={selectedEvent.eventData.images[0]}
								alt={selectedEvent.title}
								className="w-full object-cover aspect-video rounded-lg shadow-md"
							/>
						)}
					</div>
					<div className="flex-1 text-left">
						<h2 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
						<div className="mt-2 space-y-1 items-center">
							<div className="flex items-center text-sm text-gray-600">
								<Clock className="h-4 w-4 mr-2 text-blue-500" />
								{selectedEvent.time}
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<MapPin className="h-4 w-4 mr-2 text-red-500" />
								{selectedEvent.eventData.isOnline
									? "Online"
									: selectedEvent.eventData.isHomeService
										? "Home Service"
										: `${selectedEvent.eventData.location} ${selectedEvent.eventData.landmark} ${selectedEvent.eventData.state}`}
							</div>
							<div className="flex items-center text-sm text-gray-600">
								<Users className="h-4 w-4 mr-2 text-green-500" />
								{selectedEvent.eventData.isMonthlySubscription
									? "Monthly Subscription"
									: `Max Participants: ${selectedEvent.eventData.maximumParticipants}`}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-gray-50 p-2 rounded-lg">
				<div className="flex items-center mb-4">
					<Calendar className="h-4 w-4 mr-2 text-purple-500" />
					<h3 className="text-sm font-semibold text-gray-700">Available Slots for {dateStr}</h3>
				</div>

				{selectedEvent.eventData.bookingChart?.filter((b) => b.date === dateStr).length === 0 ? (
					<div className="text-center text-gray-500 py-4">No available slots for this date</div>
				) : (
					<div className="space-y-3">
						{selectedEvent.eventData.bookingChart
							?.filter((b) => b.date === dateStr)
							.map((bookingEachChart, index) => (
								<SwitchOnOff
									key={index}
									maximumParticipants={selectedEvent.eventData.maximumParticipants}
									bookingEachChart={bookingEachChart}
									refetch={refetch}
									isMonthlySubscription={selectedEvent.eventData.isMonthlySubscription}
								/>
							))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EventSlotDetails;
