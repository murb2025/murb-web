import React from "react";
import { Button, Checkbox, Input, Label } from "@/components/ui";
import { IEvent } from "@/types/event.type";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

import { CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { eventSpecificTypeEnum } from "@/constants/event.constant";

export default function DateSelector({
	event,
	updateEvent,
	handleInputChange,
	isMultipleDays,
	isNumberOfDays,
}: {
	event: IEvent;
	updateEvent: (event: IEvent) => void;
	handleInputChange: (field: keyof IEvent, value: any) => void;
	isMultipleDays: boolean;
	isNumberOfDays: boolean;
}) {
	return isMultipleDays ? (
		<section>
			<div className="flex space-x-2 mb-4 bg-white px-[8px] py-[5px] rounded-lg w-fit shadow-md">
				<Button
					type="button"
					variant={event.multipleDays === false ? "default" : "outline"}
					className={`flex-1 border-0 text-[14px] md:text-[16px] font-normal ${
						event.multipleDays === false ? "bg-[#C3996B] hover:bg-[#C3996B] text-white" : "text-[#8E7777]"
					}`}
					onClick={() =>
						updateEvent({
							...event,
							multipleDays: false,
							isMonthlySubscription: false,
							startDate: "",
							endDate: "",
							weekDays: [],
						})
					}
				>
					One Time Sport
				</Button>
				<Button
					type="button"
					variant={event.multipleDays === true ? "default" : "outline"}
					className={`flex-1 border-0 text-[14px] md:text-[16px] font-normal ${
						event.multipleDays === true ? "bg-[#C3996B] hover:bg-[#C3996B] text-white" : "text-[#8E7777]"
					}`}
					onClick={() =>
						updateEvent({
							...event,
							multipleDays: true,
							startDate: "",
						})
					}
				>
					Recurring Sport
				</Button>
			</div>

			{event.multipleDays === false ? (
				<>
					<Label htmlFor="startdate" className="text-[18px] md:text-[20px] font-normal text-[#1F1F1F]">
						Date
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal text-[14px] md:text-[16px] text-[#8E7777]",
									!event.startDate && "text-muted-foreground",
								)}
							>
								{event.startDate ? (
									format(new Date(event.startDate), "PPP")
								) : (
									<span className="text-[14px] md:text-[16px] text-[#8E7777]">dd/mm/yyyy</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={event.startDate ? new Date(event.startDate) : undefined}
								onSelect={(date) => {
									if (date) {
										// Adjust for timezone offset
										const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
										const selectedDate = localDate.toISOString().split("T")[0];
										handleInputChange("startDate", selectedDate);
									}
								}}
								disabled={(date) => {
									const today = new Date();
									today.setHours(0, 0, 0, 0);
									return date < today;
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</>
			) : (
				<section className="space-y-4">
					<div className="flex items-center w-full gap-2 bg-white px-4 py-3 rounded-lg">
						<Checkbox
							id="selectAll"
							checked={event.isMonthlySubscription}
							onCheckedChange={(isChecked) => {
								updateEvent({
									...event,
									isMonthlySubscription: isChecked ? true : false,
									maximumParticipants: 0,
								});
							}}
							className="h-5 w-5"
						/>
						<Label
							htmlFor="selectAll"
							className="text-[14px] md:text-[16px] text-[#6F5C5CBA] font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Monthly Subscription
						</Label>
					</div>

					<div className="flex flex-col md:flex-row gap-3 w-full">
						<span className="w-full">
							<HoverCard>
								<HoverCardTrigger asChild>
									<Label
										htmlFor="startdate"
										className="text-[18px] md:text-[20px] flex items-center gap-2 font-normal text-[#1F1F1F]"
									>
										Start Date <Info className="w-4 h-4" />
									</Label>
								</HoverCardTrigger>
								<HoverCardContent>Start date of listing</HoverCardContent>
							</HoverCard>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal mt-1 text-[14px] md:text-[16px] text-[#8E7777]",
											!event.startDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{event.startDate ? (
											format(new Date(event.startDate), "PPP")
										) : (
											<span className="text-[14px] md:text-[16px] text-[#8E7777]">
												Pick a date
											</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={event.startDate ? new Date(event.startDate) : undefined}
										onSelect={(date) => {
											if (date) {
												// Adjust for timezone offset
												const localDate = new Date(
													date.getTime() - date.getTimezoneOffset() * 60000,
												);
												const selectedDate = localDate.toISOString().split("T")[0];
												handleInputChange("startDate", selectedDate);
											}
										}}
										disabled={(date) => {
											const today = new Date();
											today.setHours(0, 0, 0, 0);
											return date < today;
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</span>
						<span className="w-full">
							<HoverCard>
								<HoverCardTrigger asChild>
									<Label
										htmlFor="endDate"
										className="text-[18px] md:text-[20px] flex items-center gap-2 font-normal text-[#1F1F1F]"
									>
										End Date <Info className="w-4 h-4" />
									</Label>
								</HoverCardTrigger>
								<HoverCardContent>End date of listing</HoverCardContent>
							</HoverCard>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal mt-1 text-[14px] md:text-[16px] text-[#8E7777]",
											!event.endDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{event.endDate ? (
											format(new Date(event.endDate), "PPP")
										) : (
											<span className="text-[14px] md:text-[16px] text-[#8E7777]">
												Pick a date
											</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={event.endDate ? new Date(event.endDate) : undefined}
										onSelect={(date) => {
											if (date) {
												// Adjust for timezone offset
												const localDate = new Date(
													date.getTime() - date.getTimezoneOffset() * 60000,
												);
												const selectedDate = localDate.toISOString().split("T")[0];
												handleInputChange("endDate", selectedDate);
											}
										}}
										disabled={(date: Date): boolean => {
											const today = new Date();
											today.setHours(0, 0, 0, 0);
											return (
												date < today ||
												(event.startDate ? date < new Date(event.startDate) : false)
											);
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</span>
					</div>
				</section>
			)}
		</section>
	) : (
		<section>
			<div className="flex space-x-2 mb-4 bg-white px-[8px] py-[5px] rounded-lg w-fit shadow-md">
				<Button
					type="button"
					variant={event.multipleDays === false ? "default" : "outline"}
					className={`flex-1 border-0 text-[14px] md:text-[16px] font-normal ${
						event.multipleDays === false ? "bg-[#C3996B] hover:bg-[#C3996B] text-white" : "text-[#8E7777]"
					}`}
					onClick={() =>
						updateEvent({
							...event,
							multipleDays: false,
							isMonthlySubscription: false,
							startDate: "",
							endDate: "",
							weekDays: [],
						})
					}
				>
					One Time Sport
				</Button>
			</div>

			<>
				<Label htmlFor="startdate" className="text-[18px] md:text-[20px] font-normal text-[#1F1F1F]">
					Date
				</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal text-[14px] md:text-[16px] text-[#8E7777]",
								!event.startDate && "text-muted-foreground",
							)}
						>
							{event.startDate ? (
								format(new Date(event.startDate), "PPP")
							) : (
								<span className="text-[14px] md:text-[16px] text-[#8E7777]">dd/mm/yyyy</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={event.startDate ? new Date(event.startDate) : undefined}
							onSelect={(date) => {
								if (date) {
									// Adjust for timezone offset
									const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
									const selectedDate = localDate.toISOString().split("T")[0];
									handleInputChange("startDate", selectedDate);
								}
							}}
							disabled={(date) => {
								const today = new Date();
								today.setHours(0, 0, 0, 0);
								return date < today;
							}}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</>

			{isNumberOfDays && (
				<section className="mt-2">
					<Label htmlFor="numberOfDays" className="text-[18px] md:text-[20px] font-normal text-[#1F1F1F]">
						How many days{" "}
						{event.eventSpecificType === eventSpecificTypeEnum.TRAINER
							? "Training"
							: event.eventSpecificType === eventSpecificTypeEnum.CLASSES_SESSIONS ? "tournament" : event.eventSpecificType}{" "}

							
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
		</section>
	);
}
