import React, { useState, useEffect } from "react";
import { Button, Checkbox, Input, Label } from "@/components/ui";
import { IBookingChart, IEvent } from "@/types/event.type";
import { toast } from "react-hot-toast";
import { eventSpecificTypeEnum } from "@/constants/event.constant";
import DateSelector from "./DateSelector";

interface ScheduleTabProps {
	handlePageTransition: (_: number) => void;
	currentPage: number;
	isMultipleDays: boolean;
	isHaveSlots: boolean;
	isTeamEvent: boolean;
	isMaxParticipants?: boolean;
	isNumberOfDays?: boolean;
	event: IEvent;
	updateEvent: (event: IEvent) => void;
}

export default function SlotBookingTab({
	handlePageTransition,
	currentPage,
	isHaveSlots,
	isMultipleDays,
	isTeamEvent,
	isMaxParticipants = true,
	isNumberOfDays = false,
	event,
	updateEvent,
}: ScheduleTabProps) {
	const [slotDuration, setSlotDuration] = useState<string>(event?.slotDuration?.toString() || "30");
	const [days, setDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);

	const [is24HourSlots, setIs24HourSlots] = useState(event?.endingTime === "24:00" || false);
	const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
	const [selectedSlots, setSelectedSlots] = useState<{ start: string; end: string }[]>(event?.slots || []);

	const [startingTime, setStartingTime] = useState(event?.startingTime);
	const [endingTime, setEndingTime] = useState(event?.endingTime);

	const isValidNumber = (value: string) => {
		return /^\d*$/.test(value);
	};

	const handleSlotDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || isValidNumber(value)) {
			setSlotDuration(value);
			updateEvent({
				...event,
				slotDuration: parseInt(value) || 0,
			});
			setSelectedSlots([]);
		}
	};

	useEffect(() => {
		if (event.startDate && event.endDate) {
			const startDate = new Date(event.startDate);
			const endDate = new Date(event.endDate);
			const availableDays = new Set<string>();

			const currentDate = new Date(startDate);
			while (currentDate <= endDate) {
				const dayName = currentDate.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
				availableDays.add(dayName);
				currentDate.setDate(currentDate.getDate() + 1);
			}

			setDays(Array.from(availableDays));
		}
	}, [event.startDate, event.endDate]);

	const handleDayToggle = (day: string) => {
		if (event.weekDays) {
			let weekDays = [...(event.weekDays || [])];
			if (weekDays.includes(day)) {
				weekDays = weekDays.filter((d) => d !== day);
			} else {
				weekDays = [...weekDays, day];
			}
			updateEvent({
				...event,
				weekDays: weekDays,
			});
		}
	};

	const handleSelectAll = () => {
		updateEvent({
			...event,
			weekDays: event.weekDays?.length === days.length ? [] : days,
		});
	};

	const generateBookingChart = () => {
		// Return early if there's no change needed
		if (event.bookingChart && event.bookingChart.length > 0 && !hasBookingParamsChanged()) {
			return;
		}

		let bookingChart: {
			date: string;
			slot?: {
				startTime: string;
				endTime: string;
			};
			bookedSeats: number;
			isBookingEnabled: boolean;
		}[] = [];

		if (event.multipleDays) {
			if (event.startDate && event.endDate && event.weekDays && event.weekDays.length > 0) {
				const start = new Date(event.startDate);
				const end = new Date(event.endDate);

				// Don't modify the original dates
				const currentDate = new Date(start);

				while (currentDate <= end) {
					const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });

					if (event.weekDays.includes(dayName.toUpperCase())) {
						const dateStr = currentDate.toISOString().split("T")[0];
						bookingChart.push({
							date: dateStr,
							slot: !isHaveSlots
								? {
									startTime: event.startingTime,
									endTime: event.endingTime,
								}
								: undefined,
							bookedSeats: 0,
							isBookingEnabled: true,
						});
					}

					currentDate.setDate(currentDate.getDate() + 1);
				}
			}
		} else {
			if (event.startDate) {
				const dateStr = new Date(event.startDate).toISOString().split("T")[0];
				bookingChart.push({
					date: dateStr,
					slot: !isHaveSlots
						? {
							startTime: event.startingTime,
							endTime: event.endingTime,
						}
						: undefined,
					bookedSeats: 0,
					isBookingEnabled: true,
				});
			}
		}

		if (event.isHaveSlots && selectedSlots.length > 0) {
			const entriesWithSlots: typeof bookingChart = [];
			bookingChart.forEach((entry) => {
				selectedSlots.forEach((slot) => {
					entriesWithSlots.push({
						date: entry.date,
						slot: {
							startTime: slot.start,
							endTime: slot.end,
						},
						bookedSeats: 0,
						isBookingEnabled: true,
					});
				});
			});
			bookingChart = entriesWithSlots;
		}

		// Preserve booked seats from existing booking chart
		if (event.bookingChart && event.bookingChart.length > 0) {
			bookingChart = mergeBookingCharts(bookingChart, event.bookingChart);
		}

		updateEvent({
			...event,
			isHaveSlots: isHaveSlots,
			slotDuration: parseInt(slotDuration),
			startingTime: startingTime,
			endingTime: endingTime,
			slots: selectedSlots,
			bookingChart: bookingChart as IBookingChart[],
			maximumParticipants: isMaxParticipants ? event.maximumParticipants : 1,
		});
	};

	// Check if booking parameters have changed
	const hasBookingParamsChanged = () => {
		// Check if any of the parameters that affect booking slots have changed
		return (
			!event.bookingChart ||
			event.bookingChart.length === 0 ||
			hasDateChanged() ||
			hasWeekDaysChanged() ||
			hasSlotsChanged() ||
			hasTimeChanged()
		);
	};

	// Check if dates have changed
	const hasDateChanged = () => {
		if (!event.bookingChart || event.bookingChart.length === 0) return true;

		const dateSet = new Set(event.bookingChart.map((entry) => entry.date));

		if (event.multipleDays) {
			if (!event.startDate || !event.endDate) return true;

			const start = new Date(event.startDate);
			const end = new Date(event.endDate);
			const currentDate = new Date(start);

			while (currentDate <= end) {
				const dateStr = currentDate.toISOString().split("T")[0];
				const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

				if (event.weekDays?.includes(dayName) && !dateSet.has(dateStr)) {
					return true;
				}
				currentDate.setDate(currentDate.getDate() + 1);
			}
		} else {
			if (!event.startDate) return true;
			const dateStr = new Date(event.startDate).toISOString().split("T")[0];
			if (!dateSet.has(dateStr)) return true;
		}

		return false;
	};

	// Check if weekdays have changed
	const hasWeekDaysChanged = () => {
		if (!event.multipleDays) return false;
		if (!event.weekDays || event.weekDays.length === 0) return true;

		const existingDays = new Set<string>();
		event.bookingChart?.forEach((entry) => {
			const date = new Date(entry.date);
			const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
			existingDays.add(dayName);
		});

		// Check if any weekday is missing or extra
		return (
			event.weekDays.some((day) => !existingDays.has(day)) ||
			Array.from(existingDays).some((day) => !event.weekDays?.includes(day))
		);
	};

	// Check if slots have changed
	const hasSlotsChanged = () => {
		if (!isHaveSlots) return false;
		if (!selectedSlots || selectedSlots.length === 0) return true;

		const existingSlots = new Set<string>();
		event.bookingChart?.forEach((entry) => {
			if (entry.slot) {
				existingSlots.add(`${entry.slot.startTime}-${entry.slot.endTime}`);
			}
		});

		// Check if any slot is missing or extra
		return (
			selectedSlots.some((slot) => !existingSlots.has(`${slot.start}-${slot.end}`)) ||
			existingSlots.size !== selectedSlots.length
		);
	};

	// Check if times have changed
	const hasTimeChanged = () => {
		if (isHaveSlots) return false;
		if (!event.startingTime || !event.endingTime) return true;

		// Check if the time range has changed
		if (event.bookingChart && event.bookingChart.length > 0) {
			const firstEntry = event.bookingChart[0];
			if (firstEntry.slot) {
				return firstEntry.slot.startTime !== event.startingTime || firstEntry.slot.endTime !== event.endingTime;
			}
		}
		return true;
	};

	// Merge booking charts to preserve booked seats and IDs
	const mergeBookingCharts = (newChart: any[], existingChart: any[]) => {
		return newChart.map((newEntry) => {
			// First try to find an exact match (same date and same slot)
			const exactMatch = existingChart.find(
				(entry) =>
					entry.date === newEntry.date &&
					((!entry.slot && !newEntry.slot) ||
						(entry.slot &&
							newEntry.slot &&
							entry.slot.startTime === newEntry.slot.startTime &&
							entry.slot.endTime === newEntry.slot.endTime)),
			);

			if (exactMatch) {
				return {
					...newEntry,
					id: exactMatch.id,
					bookedSeats: exactMatch.bookedSeats,
					isBookingEnabled: exactMatch.isBookingEnabled,
				};
			}

			// If no exact match, try to find an entry with the same date
			// This helps preserve IDs when adding slots to existing dates
			const dateMatch = existingChart.find((entry) => entry.date === newEntry.date);
			if (dateMatch) {
				return {
					...newEntry,
					id: dateMatch.id, // Preserve the ID from the existing entry
					bookedSeats: dateMatch.bookedSeats, // Reset booked seats since this is a new slot
					isBookingEnabled: dateMatch.isBookingEnabled,
				};
			}

			return newEntry;
		});
	};

	const handleOpeningTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newOpeningTime = e.target.value;
		if (!is24HourSlots && newOpeningTime >= endingTime) {
			toast.error("Opening time must be less than closing time");
			return;
		}
		setStartingTime(newOpeningTime);
		setSelectedSlots([]);
		updateEvent({
			...event,
			startingTime: newOpeningTime,
		});
	};

	const handleClosingTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newClosingTime = e.target.value;
		if (!is24HourSlots && newClosingTime <= startingTime) {
			toast.error("Closing time must be greater than starting time");
			return;
		}
		setEndingTime(newClosingTime);
		setSelectedSlots([]);
		updateEvent({
			...event,
			endingTime: newClosingTime,
		});
	};

	const toggleSlotSelection = (slot: { start: string; end: string }) => {
		setSelectedSlots((prev) => {
			const isSelected = prev.some((s) => s.start === slot.start && s.end === slot.end);
			if (isSelected) {
				return prev.filter((s) => s.start !== slot.start || s.end !== slot.end);
			} else {
				return [...prev, slot];
			}
		});
	};

	const generateSlots = () => {
		const durationNum = parseInt(slotDuration);
		if (!durationNum || durationNum < 5) return;

		const slots: { start: string; end: string }[] = [];

		// Set start and end times based on 24-hour mode
		let currentTime;
		let dayEnd;

		if (is24HourSlots) {
			// Full 24 hours
			currentTime = new Date(`2000-01-01T00:00:00`);
			dayEnd = new Date(`2000-01-02T00:00:00`);
		} else {
			// Custom time range
			const [startHour, startMinute] = startingTime.split(":").map(Number);
			const [endHour, endMinute] = endingTime.split(":").map(Number);

			currentTime = new Date(`2000-01-01T${startingTime}:00`);

			// Handle end time crossing to next day
			if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
				dayEnd = new Date(`2000-01-02T${endingTime}:00`);
			} else {
				dayEnd = new Date(`2000-01-01T${endingTime}:00`);
			}
		}

		while (currentTime < dayEnd) {
			const startTime = currentTime.toTimeString().slice(0, 5);

			currentTime.setMinutes(currentTime.getMinutes() + durationNum);

			// Format the end time, using 24:00 instead of 00:00 for the last slot
			let endTime;
			if (currentTime.getHours() === 0 && currentTime.getMinutes() === 0 && currentTime.getDate() === 2) {
				// Check if it's midnight of next day
				endTime = "24:00";
			} else {
				endTime = currentTime.toTimeString().slice(0, 5);
			}

			slots.push({ start: startTime, end: endTime });
		}

		setAvailableSlots(slots);
	};

	useEffect(() => {
		if (slotDuration && (is24HourSlots || (startingTime && endingTime))) {
			generateSlots();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slotDuration, startingTime, endingTime, is24HourSlots]);

	const isFormValid = () => {
		let isValid = Boolean(event.startDate && event.startingTime && event.endingTime);
		if (event.multipleDays) {
			isValid =
				isValid && Boolean(event.startDate && event.endDate && event.weekDays && event.weekDays.length > 0);
		}

		if (isHaveSlots && event.eventSpecificType !== eventSpecificTypeEnum.WORKSHOPS) {
			isValid = isValid && Boolean(parseInt(slotDuration) > 0 && selectedSlots && selectedSlots.length > 0);
		}

		if (event.isTeamEvent && event.isMonthlySubscription === false) {
			isValid = isValid && Boolean(event.teamSize && event.maximumParticipants);
		}

		if (isMaxParticipants && event.isMonthlySubscription === false) {
			isValid = isValid && Boolean(event.maximumParticipants);
		}

		return isValid;
	};

	const handleInputChange = (field: keyof IEvent, value: any) => {
		updateEvent({ ...event, [field]: value });
	};

	return (
		<div className="w-full px-4 md:px-0">
			<form className="bg-[#F6EFE8] space-y-4 rounded-3xl px-4 md:px-12 py-6 md:py-8 max-w-4xl mx-auto border border-[#D5AA72]">
				{/* Start Date and End Date */}
				<DateSelector
					event={event}
					updateEvent={updateEvent}
					isNumberOfDays={isNumberOfDays}
					handleInputChange={handleInputChange}
					isMultipleDays={isMultipleDays}
				/>

				{/* Slot day selection */}
				{event.multipleDays === true && (
					<section className="space-y-4">
						{isNumberOfDays && (
							<section>
								<Label
									htmlFor="numberOfDays"
									className="text-[18px] md:text-[20px] font-normal text-[#1F1F1F]"
								>
									How many days{" "}
									{event.eventSpecificType === eventSpecificTypeEnum.TRAINER
										? "Training"
										: event.eventSpecificType}{" "}
									is running in a week?
									<span className="text-[#8E7777] font-normal"> (Optional)</span>
								</Label>
								<Input
									id="numberOfDays"
									type="number"
									value={event.numberOfDays}
									onChange={(e) => handleInputChange("numberOfDays", parseInt(e.target.value))}
									className="mt-1 focus:outline-none focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777] h-[48px]"
								/>
							</section>
						)}
						<h2 className="text-[20px] md:text-[22px] font-regular text-[#1F1F1F]">Slot Booking</h2>

						<div className="grid grid-cols-4 md:flex md:flex-row gap-2 w-full">
							{days.map((day, idx) => (
								<Button
									key={idx}
									type="button"
									variant={event.weekDays?.includes(day) ? "custom" : "outline"}
									onClick={() => handleDayToggle(day)}
									className={`w-full ${event.weekDays?.includes(day) ? "bg-[#C3996B] text-white" : "text-[#8E7777]"
										}`}
								>
									{day}
								</Button>
							))}
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="selectAll"
								checked={event.weekDays?.length === days.length}
								onCheckedChange={handleSelectAll}
								className="h-5 w-5"
							/>
							<Label
								htmlFor="selectAll"
								className="text-[14px] md:text-[16px] text-[#6F5C5CBA] font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Select All
							</Label>
						</div>
					</section>
				)}

				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label
								htmlFor="startingTime"
								className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F]"
							>
								Opening Time
							</Label>
							<div className="relative">
								<Input
									id="startingTime"
									type="time"
									value={event.startingTime}
									required
									disabled={is24HourSlots}
									onChange={(e) => handleOpeningTimeChange(e)}
									className={`mt-1 h-[48px] pr-8 focus:outline-none focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777] ${is24HourSlots ? "opacity-60" : ""}`}
								/>
							</div>
						</div>
						<div>
							<Label
								htmlFor="endingTime"
								className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F]"
							>
								Closing Time
							</Label>
							<div className="relative">
								<Input
									id="endingTime"
									type="time"
									value={event.endingTime}
									required
									disabled={is24HourSlots}
									onChange={(e) => handleClosingTimeChange(e)}
									className={`mt-1 pr-8 h-[48px] focus:outline-none focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777] ${is24HourSlots ? "opacity-60" : ""}`}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-2 mb-4">
						<Checkbox
							id="24HourSlots"
							checked={is24HourSlots}
							onCheckedChange={(checked) => {
								setIs24HourSlots(!!checked);
								if (checked) {
									setStartingTime("00:00");
									setEndingTime("24:00");
									updateEvent({
										...event,
										startingTime: "00:00",
										endingTime: "24:00",
									});
								}
								setSelectedSlots([]);
							}}
							className="h-5 w-5"
						/>
						<Label
							htmlFor="24HourSlots"
							className="text-[16px] md:text-[18px] text-[#6F5C5CBA] font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							24 Hours Slots
						</Label>
					</div>

					{isHaveSlots && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label
										htmlFor="duration"
										className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F]"
									>
										Duration of each slot{" "}
										<span className="text-[#8E7777] text-[16px] md:text-[18px] ml-2">
											(Minimum 5 minutes)
										</span>
									</Label>
									<Input
										id="duration"
										type="tel"
										// inputMode="numeric"
										value={event.slotDuration}
										onChange={(e) => handleSlotDurationChange(e)}
										className="mt-1 h-[48px] focus:outline-none focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777]"
										placeholder="Enter duration (minimum 5 minutes)"
									/>
								</div>
							</div>

							{availableSlots.length > 0 && (
								<div>
									<Label className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F] mb-2 block">
										Select Available Slots
									</Label>
									<div className="flex flex-wrap gap-2 mt-1">
										{availableSlots.map((slot, index) => (
											<Button
												key={index}
												type="button"
												onClick={() => toggleSlotSelection(slot)}
												className={`flex items-center justify-center text-[14px] md:text-[16px] font-normal rounded-[38px] px-3 md:px-4 py-1 md:py-2 transition-all ease duration-300 ${selectedSlots.some(
													(s) => s.start === slot.start && s.end === slot.end,
												)
														? "bg-[#C3996B] text-white hover:bg-[#C3996B]"
														: "bg-white text-[#8E7777] border-none hover:bg-[#C3996B] hover:text-white hover:scale-105 transition-all ease-in-out duration-300"
													}`}
											>
												{slot.start} - {slot.end}
											</Button>
										))}
									</div>
								</div>
							)}
						</>
					)}

					{isMaxParticipants && event.isMonthlySubscription === false ? (
						<>
							{isTeamEvent ? (
								<div className="space-y-4">
									<div className="flex space-x-2 bg-white px-[8px] py-[5px] rounded-lg w-fit shadow-md">
										<Button
											type="button"
											variant={event.isTeamEvent === false ? "default" : "outline"}
											className={`flex-1 border-0 h-[40px] md:h-[48px] text-[16px] md:text-[20px] font-normal ${event.isTeamEvent === false
													? "bg-[#C3996B] hover:bg-[#C3996B] text-white"
													: "text-[#8E7777]"
												}`}
											onClick={() => {
												// handleInputChange("isTeamEvent", false);
												updateEvent({
													...event,
													teamSize: 0,
													maximumParticipants: 0,
													isTeamEvent: false,
												});
											}}
										>
											Single Event
										</Button>
										<Button
											type="button"
											variant={event.isTeamEvent === true ? "default" : "outline"}
											className={`flex-1 h-[40px] md:h-[48px] border-0 text-[16px] md:text-[20px] font-normal ${event.isTeamEvent === true
													? "bg-[#C3996B] hover:bg-[#C3996B] text-white"
													: "text-[#8E7777]"
												}`}
											onClick={() => {
												// handleInputChange("isTeamEvent", true);
												updateEvent({
													...event,
													teamSize: 0,
													maximumParticipants: 0,
													isTeamEvent: true,
												});
											}}
										>
											Team Event
										</Button>
									</div>
									{event.isTeamEvent ? (
										<section className="flex flex-col md:flex-row gap-4">
											<div className="w-full">
												<Label
													htmlFor="teamSize"
													className="text-[18px] md:text-[20px] font-normal text-[#1F1F1F]"
												>
													Maximum Participants per team
												</Label>
												<Input
													id="teamSize"
													type="number"
													value={event.teamSize}
													onChange={(e) => {
														updateEvent({
															...event,
															teamSize: parseInt(e.target.value),
														});
													}}
													placeholder="Maximum Participants per team"
													className="mt-1 focus:outline-none focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777] h-[48px]"
												/>
											</div>
											<div className="w-full">
												<Label
													htmlFor="maxParticipants"
													className="text-[18px] md:text-[20px] font-normal text-[#1F1F1F]"
												>
													Maximum Teams
												</Label>
												<Input
													id="maxParticipantsPerTeam"
													type="number"
													value={event.maximumParticipants}
													onChange={(e) =>
														updateEvent({
															...event,
															maximumParticipants: parseInt(e.target.value),
														})
													}
													placeholder="Maximum Participants"
													className="mt-1 focus:outline-none focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777] h-[48px]"
												/>
											</div>
										</section>
									) : (
										<div>
											<Label
												htmlFor="maxParticipants"
												className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F]"
											>
												Maximum Participants
											</Label>
											<Input
												id="maxParticipants"
												type="number"
												inputMode="numeric"
												value={event.maximumParticipants}
												onChange={(e) =>
													updateEvent({
														...event,
														maximumParticipants: parseInt(e.target.value),
													})
												}
												className="mt-1 focus:outline-none h-[48px] focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777]"
											/>
										</div>
									)}
								</div>
							) : (
								<div>
									<Label
										htmlFor="maxParticipants"
										className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F]"
									>
										Maximum Participants
									</Label>
									<Input
										id="maxParticipants"
										type="number"
										inputMode="numeric"
										value={event.maximumParticipants}
										onChange={(e) => {
											updateEvent({
												...event,
												maximumParticipants: parseInt(e.target.value),
											});
										}}
										className="mt-1 focus:outline-none h-[48px] focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777]"
									/>
								</div>
							)}
							<div>
								<Label
									htmlFor="maxParticipants"
									className="text-[20px] md:text-[22px] font-normal text-[#1F1F1F]"
								>
									Minimum Participants (Optional)
								</Label>
								<Input
									id="minParticipants"
									type="number"
									inputMode="numeric"
									value={event.minimumParticipants}
									onChange={(e) =>
										updateEvent({
											...event,
											minimumParticipants: parseInt(e.target.value),
										})
									}
									className="mt-1 focus:outline-none h-[48px] focus:border-[#DAC0A3] text-[16px] md:text-[20px] text-[#8E7777]"
								/>
							</div>
						</>
					) : null}
				</div>
			</form>
			<div className="flex justify-center my-6">
				<Button
					className="bg-black mt-6 text-[18px] md:text-[22px] text-white px-8 md:px-12 py-2 md:py-3 hover:bg-gray-800 hover:scale-95 transition-all ease duration-300"
					onClick={(e) => {
						e.preventDefault();
						handlePageTransition(currentPage + 1);
						generateBookingChart();
					}}
					disabled={!isFormValid()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
