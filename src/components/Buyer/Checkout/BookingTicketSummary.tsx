"use client";
import React, { useState, useEffect } from "react";
import { MapPin, ChevronRight, Info, ChevronDown, Tag, Shield, TicketIcon } from "lucide-react";
import { IBookingChart, IBookingDetail, IEvent } from "@/types/event.type";
import Image from "next/image";
import { appTermsAndConditions } from "@/constants/booking.constant";
import {
	AlertDialog,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { calculateAmountWithTax } from "@/constants/event.constant";
import moment from "moment";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import CalendarSlotSelector from "./CalendarSlotSelector";

export const BookingTicketSummary = ({
	eventData,
	selectedSlot,
	setSelectedSlot,
	totalAmount,
	selectedTickets,
	tickets,
}: {
	eventData: IEvent;
	selectedSlot: IBookingChart | null;
	setSelectedSlot: (slot: IBookingChart) => void;
	totalTickets: number;
	totalAmount: number;
	selectedTickets: Record<string, number>;
	tickets: IBookingDetail[];
}) => {
	const [isBookingFeesExpanded, setIsBookingFeesExpanded] = useState(false);
	const { data: session } = useSession();

	const isEventOwner = session?.user.id === eventData.vendorId;

	// Calculate the fees based on percentages
	const { amountWithTax, convenienceFee, cgst, sgst } = calculateAmountWithTax(totalAmount);

	// Helper function to format date
	const formatDate = (dateString: string) => {
		return moment(dateString).format("ddd, MMM D, YYYY");
	};

	return (
		<div className="bg-white rounded-3xl border shadow-sm p-4 transition-all">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-gray-900">Booking Summary</h2>
			</div>

			{/* Event Details Card */}
			<div className="space-y-4">
				<div className="flex md:flex-row flex-col items-start gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
					<div className="relative h-full md:w-32 rounded-lg aspect-video overflow-hidden">
						<Image
							src={
								Array.isArray(eventData?.images)
									? eventData?.images[0]
									: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y29uY2VydHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
							}
							alt={"Event"}
							fill
							className="object-cover"
						/>
					</div>
					<div className="space-y-2 flex-1">
						{isEventOwner && <h3 className="font-semibold text-gray-900">{eventData?.title}</h3>}

						<div className="flex gap-2 items-start text-gray-600 text-sm mt-1">
							<MapPin className="w-4 h-4 shrink-0 mt-0.5" />
							{eventData?.isOnline ? (
								<span className="flex items-center">
									Online Event
									<Badge className="ml-2 bg-blue-500" variant="secondary">
										Virtual
									</Badge>
								</span>
							) : eventData?.isHomeService ? (
								<Badge className="ml-2 bg-blue-500" variant="secondary">
									At your location
								</Badge>
							) : (
								<div className="flex flex-col">
									{eventData?.landmark && <span>{eventData?.landmark}</span>}
									<span>{`${eventData?.city}, ${eventData?.state}`}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Date & Time Selection */}
				<CalendarSlotSelector
					bookingChart={eventData.bookingChart}
					maximumParticipants={eventData.maximumParticipants}
					numberOfDays={eventData.numberOfDays}
					selectedSlot={selectedSlot}
					setSelectedSlot={setSelectedSlot}
					isMonthlySubscription={eventData.isMonthlySubscription}
					formatDate={formatDate}
				/>

				<hr />
				{/* Tickets Section */}
				<div>
					<div className="flex items-center mb-2">
						<TicketIcon className="w-4 h-4 mr-2 text-gray-600" />
						<h4 className="font-semibold text-gray-900 text-sm">Tickets</h4>
					</div>

					<div className="space-y-3">
						{Object.entries(selectedTickets).map(([ticketId, quantity]) => {
							const ticket = tickets.find((t) => t.id === ticketId);
							if (!ticket || quantity === 0) return null;

							const isGroup = ticket.type === "GROUP" && ticket.membersCount;
							const displayQuantity = isGroup ? Math.ceil(quantity / ticket.membersCount) : quantity;
							const ticketType = isGroup ? "Group" : "Individual";

							return (
								<div
									key={ticketId}
									className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
								>
									<div className="flex flex-col">
										<div className="flex items-center">
											<span className="font-medium">{ticket.title || ticketType}</span>
											{ticket.type && (
												<Badge variant="outline" className="ml-2 text-xs">
													{ticket.type.charAt(0).toUpperCase() +
														ticket.type.slice(1).toLowerCase()}
												</Badge>
											)}
										</div>
										<div className="text-sm text-gray-600">
											{isGroup
												? `${displayQuantity} group${displayQuantity > 1 ? "s" : ""} × ${ticket.membersCount} people`
												: `${quantity} ticket${quantity > 1 ? "s" : ""}`}
										</div>
									</div>
									<div className="text-right">
										<div className="font-medium">
											{ticket.currencyIcon || "₹"}{" "}
											{new Intl.NumberFormat("en-IN").format(
												isGroup
													? ticket.amount * Math.ceil(quantity / ticket.membersCount)
													: ticket.amount * quantity,
											)}
										</div>
										<div className="text-sm text-gray-500">
											{ticket.currencyIcon || "₹"}{" "}
											{new Intl.NumberFormat("en-IN").format(ticket.amount)} each
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<hr />
				{/* Price Details */}
				<div>
					<div className="flex items-center mb-2">
						<Tag className="w-4 h-4 mr-2 text-gray-600" />
						<h4 className="font-semibold text-gray-900 text-sm">Price Details</h4>
					</div>

					{/* Subtotal */}
					<div className="flex justify-between text-base mt-2">
						<span className="text-gray-600">Subtotal</span>
						<span className="text-gray-900">
							{eventData.bookingDetails[0].currencyIcon}{" "}
							{new Intl.NumberFormat("en-IN").format(totalAmount)}
						</span>
					</div>

					{/* Fees Section */}
					<div>
						<div
							className="flex justify-between text-sm items-center cursor-pointer hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
							onClick={() => setIsBookingFeesExpanded(!isBookingFeesExpanded)}
						>
							<div className="flex items-center gap-2">
								<span className="text-gray-600">Booking Fees</span>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<Info className="w-3.5 h-3.5 text-gray-400" />
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-xs">Additional fees for processing your booking</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<ChevronDown
									className={`w-4 h-4 transition-transform text-gray-500 ${isBookingFeesExpanded ? "rotate-180" : ""}`}
								/>
							</div>
							<span className="text-gray-900">
								{eventData.bookingDetails[0].currencyIcon}{" "}
								{new Intl.NumberFormat("en-IN").format(convenienceFee + cgst + sgst)}
							</span>
						</div>

						{/* Additional fees (shown when expanded) */}
						{isBookingFeesExpanded && (
							<div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-100 mx-2">
								<div className="flex justify-between text-sm">
									<span className="text-gray-500">Convenience Fees</span>
									<span className="text-gray-700">
										{eventData.bookingDetails[0].currencyIcon || "₹"}{" "}
										{new Intl.NumberFormat("en-IN").format(convenienceFee)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-500">CGST</span>
									<span className="text-gray-700">
										{eventData.bookingDetails[0].currencyIcon || "₹"}{" "}
										{new Intl.NumberFormat("en-IN").format(cgst)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-500">SGST</span>
									<span className="text-gray-700">
										{eventData.bookingDetails[0].currencyIcon || "₹"}{" "}
										{new Intl.NumberFormat("en-IN").format(sgst)}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
				<hr />
				{/* Total */}
				<div>
					<div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
						<span className="font-semibold text-gray-900">
							Total Amount ({eventData.bookingDetails[0].currency})
						</span>
						<span className="font-bold text-xl text-gray-900">
							{eventData.bookingDetails[0].currencyIcon || "₹"}{" "}
							{new Intl.NumberFormat("en-IN").format(amountWithTax)}
						</span>
					</div>
				</div>
				<hr />
				{/* Cancellation Policy */}
				<div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<div className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
								<div className="flex items-center text-gray-700">
									<Shield className="w-4 h-4 mr-2 text-gray-600" />
									<span className="font-medium">Cancellation Policy & Refunds</span>
								</div>
								<button className="text-gray-400 hover:text-gray-500">
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						</AlertDialogTrigger>
						<AlertDialogContent className="md:min-w-[800px]">
							<AlertDialogHeader>
								<AlertDialogTitle className="text-xl flex items-center gap-2">
									<Shield className="w-5 h-5" />
									Cancellation Policy & Refunds
								</AlertDialogTitle>
								<AlertDialogDescription className="px-4 py-2 max-h-[75vh] overflow-y-auto">
									<ol className="text-left text-lg list-decimal px-6 overflow-y-auto space-y-2">
										{appTermsAndConditions.slice(0, 3).map((text, idx) => (
											<li key={idx} className="text-gray-700">
												{text}
											</li>
										))}
									</ol>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="flex gap-4">
								<AlertDialogCancel>Close</AlertDialogCancel>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	);
};
