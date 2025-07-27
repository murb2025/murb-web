import EventCalendar from "@/components/event/Calendar/EventCalendar";
import React from "react";

const Calendar = () => {
	return (
		<div>
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-black text-2xl font-medium">Event Calender</h2>
			</div>
			<EventCalendar />
		</div>
	);
};

export default Calendar;
