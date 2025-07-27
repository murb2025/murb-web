import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IBookingChart } from "@/types/event.type";

interface CalendarSlotSelectorProps {
	bookingChart: IBookingChart[];
	maximumParticipants: number;
	numberOfDays: number;
	selectedSlot: IBookingChart | null;
	setSelectedSlot: (slot: IBookingChart) => void;
	isMonthlySubscription: boolean;
	formatDate: (date: string) => string;
}

const CalendarSlotSelector: React.FC<CalendarSlotSelectorProps> = ({
	bookingChart,
	maximumParticipants,
	numberOfDays,
	selectedSlot,
	setSelectedSlot,
	formatDate,
	isMonthlySubscription,
}) => {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [calendarStep, setCalendarStep] = useState<"date" | "time">("date");

	// Convert time to AM/PM format
	const formatTimeToAMPM = (timeStr?: string): string => {
		if (!timeStr) return "";
		const [hours, minutes] = timeStr.split(":").map(Number);
		const period = hours >= 12 ? "PM" : "AM";
		const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
		return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
	};

	return (
		<div className="grid gap-3">
			<div className="flex items-center text-gray-700 text-sm font-medium">
				<CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
				<span>Select Date & Time</span>
			</div>
			<div className="flex items-center">
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-between text-left relative overflow-hidden group",
								selectedSlot ? "border-blue-200 bg-blue-50" : "",
							)}
						>
							{selectedSlot ? (
								<div className="flex flex-col">
									<span className="font-medium">{formatDate(selectedSlot.date)}</span>
									<span className="text-sm text-gray-600">
										{`${formatTimeToAMPM(selectedSlot.slot?.startTime)} - ${formatTimeToAMPM(selectedSlot.slot?.endTime)}`}
									</span>
								</div>
							) : (
								<span className="text-gray-500">Select a date and time slot</span>
							)}
							<div className="absolute inset-y-0 right-0 pr-2 flex items-center bg-gradient-to-l from-white via-white to-transparent pl-6 group-hover:from-gray-50 group-hover:via-gray-50">
								<ChevronDown className="h-4 w-4 text-gray-500" />
							</div>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full p-0 shadow-lg border-gray-200">
						{/* Two-step selection process */}
						<div className="flex flex-col">
							{/* Step 1: Calendar View */}
							{calendarStep === "date" && (
								<div className="border-b">
									<div className="text-center text-sm text-gray-600 py-1">
										Please select an available date to see time slots
									</div>
									<Calendar
										mode="single"
										selected={selectedDate}
										onSelect={(date) => {
											setSelectedDate(date);
											if (date) {
												const dateStr = date.toISOString().split("T")[0];
												if (bookingChart.some((chart) => chart.date === dateStr)) {
													setCalendarStep("time");
												}
											}
										}}
										// Highlight dates that have available slots
										modifiers={{
											unavailable: (date) => {
												const dateStr = date.toISOString().split("T")[0];
												return bookingChart.some(
													(chart) => chart.date === dateStr && !chart.isBookingEnabled,
												);
											},
											available: (date) => {
												const dateStr = date.toISOString().split("T")[0];
												return bookingChart.some(
													(chart) =>
														chart.date === dateStr &&
														new Date(dateStr) >= new Date(new Date().setHours(0, 0, 0, 0)),
												);
											},
											disabled: (date) => {
												const dateStr = date.toISOString().split("T")[0];
												return (
													!bookingChart.some((chart) => chart.date === dateStr) ||
													new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0))
												);
											},
										}}
										className="rounded-md border"
									/>
								</div>
							)}

							{/* Step 2: Time Slots for Selected Date */}
							{calendarStep === "time" && selectedDate && (
								<div className="max-h-[250px] overflow-y-auto">
									<Button variant="ghost" size="sm" onClick={() => setCalendarStep("date")}>
										<ChevronLeft className="mr-1" />
										Back
									</Button>

									<table className="w-full">
										<thead className="sticky top-0 bg-white shadow-sm z-10">
											<tr className="border-b">
												<th className="p-3 text-left font-medium text-gray-700">Time</th>
												<th className="p-3 text-left font-medium text-gray-700">
													Availability
												</th>
											</tr>
										</thead>
										<tbody>
											{bookingChart
												.filter(
													(chart) => chart.date === selectedDate.toISOString().split("T")[0],
												)
												.sort((a, b) => {
													// Sort by startTime
													if (!a.slot?.startTime || !b.slot?.startTime) return 0;

													const aStartParts = a.slot.startTime.split(":").map(Number);
													const bStartParts = b.slot.startTime.split(":").map(Number);
													const aStartMinutes = aStartParts[0] * 60 + aStartParts[1];
													const bStartMinutes = bStartParts[0] * 60 + bStartParts[1];
													return aStartMinutes - bStartMinutes;
												})
												.map((chart, index) => {
													const isPastDate =
														new Date(chart.date) <
														new Date(new Date().setHours(0, 0, 0, 0));
													const seatsLeft = maximumParticipants - chart.bookedSeats;
													const isSelected = selectedSlot?.id === chart.id;

													return (
														<tr
															key={index}
															className={cn(
																"relative hover:bg-blue-50 border-b border-gray-100 transition-colors",
																isSelected && "bg-blue-50",
																isPastDate
																	? "bg-red-100 cursor-not-allowed opacity-60"
																	: "cursor-pointer",
																!chart.isBookingEnabled &&
																	"bg-yellow-50 cursor-not-allowed opacity-60",
																seatsLeft <= 0 &&
																	!isMonthlySubscription &&
																	"bg-red-50 cursor-not-allowed opacity-60",
															)}
															onClick={() => {
																if (
																	!isPastDate &&
																	chart.isBookingEnabled &&
																	(!isMonthlySubscription ? seatsLeft > 0 : true)
																) {
																	setSelectedSlot(chart);
																	const popoverTrigger =
																		document.querySelector('[data-state="open"]');
																	if (popoverTrigger) {
																		(popoverTrigger as HTMLElement).click();
																	}
																}
															}}
														>
															<td className="p-3">
																<div className="font-medium text-gray-800 whitespace-nowrap">
																	{`${formatTimeToAMPM(chart.slot?.startTime)} - ${formatTimeToAMPM(chart.slot?.endTime)}`}
																</div>
																{numberOfDays > 1 && (
																	<div className="text-gray-500 text-xs mt-1">
																		({numberOfDays} days)
																	</div>
																)}
															</td>

															<td className="p-2 text-right whitespace-nowrap">
																{!isMonthlySubscription ? (
																	seatsLeft <= 0 ? (
																		<Badge
																			variant="destructive"
																			className="bg-red-100 text-red-700 hover:bg-red-100 shadow-sm"
																		>
																			Sold Out
																		</Badge>
																	) : seatsLeft < 10 ? (
																		<Badge
																			variant="outline"
																			className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
																		>
																			Only few left
																		</Badge>
																	) : (
																		<Badge
																			variant="outline"
																			className="bg-green-50 text-green-700 border-green-200 shadow-sm opacity-80"
																		>
																			Available
																		</Badge>
																	)
																) : (
																	<Badge
																		variant="outline"
																		className="bg-green-50 text-green-700 border-green-200 shadow-sm opacity-80"
																	>
																		Available
																	</Badge>
																)}
															</td>
														</tr>
													);
												})}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

export default CalendarSlotSelector;
