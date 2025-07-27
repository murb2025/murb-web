"use client";
import React, { useState } from "react";
import { Minus, Plus, CircleArrowDown, LoaderCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IBookingChart, IEvent, IOrderRequest } from "@/types/event.type";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
import lodash from "lodash";
import { BookingTicketSummary } from "./BookingTicketSummary";
import { trpc } from "@/app/provider";

// Phone number regex for Indian phone numbers
const phoneRegex = /^(?:(?:\+91)|(?:91)|(?:0))?[6789]\d{9}$/;

// Base schema for a member
const memberSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	phone: z.string().regex(phoneRegex, "Invalid phone number format"),
	email: z.string().email("Invalid email format"),
});

// Form schema
const formSchema = z.object({
	isGroupBooking: z.boolean(),
	members: z.array(memberSchema).optional(),
	acceptedTerms: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms and conditions",
	}),
});

type FormData = z.infer<typeof formSchema>;

export default function Helper({ eventData }: { eventData: IEvent }) {
	const { data: session } = useSession();
	const [selectedSlot, setSelectedSlot] = useState<IBookingChart | null>(null);

	const isUserLoggedIn = !!session?.user;

	const [isLoading, setIsLoading] = useState(false);

	const [currentStep, setCurrentStep] = useState(1);
	const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

	const [isOpenStep1, setIsOpenStep1] = useState(false);
	const [isOpenStep2, setIsOpenStep2] = useState(false);
	const [showTicketError, setShowTicketError] = useState(false);

	const router = useRouter();

	const {
		mutateAsync: createOrder,
		isLoading: isOrderLoading,
		isError: isOrderError,
		error: orderError,
	} = trpc.booking.createOrder.useMutation();
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			isGroupBooking: false,
			members: [],
			acceptedTerms: false,
		},
	});
	const tickets = eventData?.bookingDetails;

	// Calculate total tickets for UI display only
	const totalTickets = Object.values(selectedTickets).reduce((acc, curr) => acc + curr, 0);

	// This calculation will ONLY be used for display purposes
	// The actual calculation will happen on the backend
	const displayTotalAmount = Object.entries(selectedTickets).reduce((acc, [ticketId, quantity]) => {
		const ticket = tickets.find((t) => t.id === ticketId);
		if (ticket?.type === "GROUP" && ticket.membersCount) {
			return acc + (ticket.amount || 0) * Math.ceil(quantity / ticket.membersCount);
		}
		return acc + (ticket?.amount || 0) * quantity;
	}, 0);

	const handleTicketChange = (ticketId: string, change: number) => {
		setSelectedTickets((prev) => {
			const current = prev[ticketId] || 0;
			const newValue = Math.max(0, current + change);
			if (newValue === 0) {
				const { [ticketId]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [ticketId]: newValue };
		});
	};

	const onSubmit = async (data: FormData) => {
		// if (eventData.vendorId === session?.user.id) {
		// 	toast.error("The owner cannot book their own sports.");
		// 	return;
		// }

		if (!selectedSlot) {
			toast.error("Please select a slot");
			return;
		}

		setIsLoading(true);

		try {
			const res = await createOrder({
				eventId: eventData.id!,
				members: data.members || [],
				tickets: Object.entries(selectedTickets).map(([ticketId, quantity]) => {
					return {
						ticketId,
						quantity,
					};
				}),
				bookingChartId: selectedSlot?.id!,
			});

			if (isOrderError) {
				throw new Error(orderError.message || "Failed to create order");
			}

			const paymentData = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				order_id: res.orderId,

				handler: async function (response: any) {
					// verify payment
					const res = await fetch("/api/verify-order", {
						method: "POST",
						body: JSON.stringify({
							orderId: response.razorpay_order_id,
							razorpayPaymentId: response.razorpay_payment_id,
							razorpaySignature: response.razorpay_signature,
						}),
					});
					const data = await res.json();
					// console.log(data);
					if (data.isOk) {
						toast.success("Payment successful");
						router.push(`/buyer/bookings/ticket/${data.bookingId}`);
					} else {
						toast.error("Payment failed");
					}
				},
			};

			const payment = new (window as any).Razorpay(paymentData);
			payment.open();
		} catch (error: any) {
			console.error("Error booking tickets:", error.message);
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Generate member fields based on total tickets
	const renderMemberFields = () => {
		// Reset form values for members when totalTickets changes
		const currentMembers = watch("members") || [];
		if (currentMembers.length > totalTickets) {
			const newMembers = currentMembers.slice(0, totalTickets);
			setValue("members", newMembers);
		}
		const fields = [];
		for (let i = 1; i <= totalTickets; i++) {
			fields.push(
				<div key={i} className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div>
							<input
								type="text"
								placeholder={`Member ${i} Name`}
								{...register(`members.${i - 1}.name` as any)}
								className={`px-4 py-3 rounded-lg border ${
									errors.members?.[i - 1]?.name ? "border-red-500" : "border-gray-200"
								} focus:border-gray-300 focus:ring-0 text-gray-600 text-sm w-full`}
							/>
							{errors.members?.[i - 1]?.name && (
								<p className="mt-1 text-xs text-red-500">{errors.members?.[i - 1]?.name?.message}</p>
							)}
						</div>
						<div>
							<input
								type="tel"
								placeholder="12345-67890"
								{...register(`members.${i - 1}.phone` as any)}
								className={`px-4 py-3 rounded-lg border ${
									errors.members?.[i - 1]?.phone ? "border-red-500" : "border-gray-200"
								} focus:border-gray-300 focus:ring-0 text-gray-600 text-sm w-full`}
							/>
							{errors.members?.[i - 1]?.phone && (
								<p className="mt-1 text-xs text-red-500">{errors.members?.[i - 1]?.phone?.message}</p>
							)}
						</div>
					</div>
					<div>
						<input
							type="email"
							placeholder={`Member ${i} email`}
							{...register(`members.${i - 1}.email` as any)}
							className={`w-full px-4 py-3 rounded-lg border ${
								errors.members?.[i - 1]?.email ? "border-red-500" : "border-gray-200"
							} focus:border-gray-300 focus:ring-0 text-gray-600 text-sm`}
						/>
						{errors.members?.[i - 1]?.email && (
							<p className="mt-1 text-xs text-red-500">{errors.members?.[i - 1]?.email?.message}</p>
						)}
					</div>
				</div>,
			);
		}
		return fields;
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{/* Left Column - Booking Form */}
			<div className="md:col-span-2 space-y-4">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">Book & Pay</h1>

				{/* Step 1: Choose Tickets */}
				<div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
					<div className="p-6">
						<div
							onClick={() => setIsOpenStep1(!isOpenStep1)}
							className="flex justify-between items-start mb-6 cursor-pointer"
						>
							<div>
								<div className="text-sm text-gray-500 mb-1">Step 1.</div>
								<h2 className="text-xl font-semibold text-gray-900">Choose Bookings</h2>
							</div>
							<button
								className={`${isOpenStep1 ? "text-[#f2c8a6]" : "text-gray-400"} hover:text-gray-500`}
							>
								<CircleArrowDown className="w-6 h-6" />
							</button>
						</div>

						{isOpenStep1 && (
							<>
								<div className="flex justify-center ">
									{Array.isArray(eventData?.images) &&
										eventData?.images.length >= 3 &&
										eventData?.images[2] !== "" && (
											<div className="bg-gray-100 relative h-48 aspect-video w-fit rounded-lg p-4 mb-6">
												<Image
													src={eventData?.images[2]}
													fill
													alt="Venue Map"
													className="w-full rounded-lg object-contain"
												/>
											</div>
										)}
								</div>

								{/* Ticket Selection */}
								<div className="space-y-4">
									{tickets.map((ticket) => (
										<div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
											<div className="flex justify-between items-start mb-2">
												<div>
													{ticket.title ? (
														<h3 className="font-semibold">
															{lodash.capitalize(ticket.title)} Package Price
														</h3>
													) : (
														<h3 className="font-semibold">
															{lodash.capitalize(ticket.type)} Ticket Price
														</h3>
													)}
													<p className="text-gray-600 text-sm mt-1">
														{ticket.currencyIcon || "₹"}{" "}
														{new Intl.NumberFormat("en-IN").format(ticket.amount)} per{" "}
														{ticket.type === "SINGLE" ? "person" : ticket.membersCount}{" "}
														person
													</p>
												</div>
												<div className="flex items-center md:space-x-3">
													<button
														onClick={() =>
															handleTicketChange(
																ticket?.id!,
																-1 * (ticket?.membersCount ?? 1),
															)
														}
														className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
													>
														<Minus className="w-4 h-4" />
													</button>
													<span className="w-8 text-center">
														{selectedTickets[ticket.id!] || 0}
													</span>
													<button
														onClick={() =>
															handleTicketChange(ticket.id!, ticket?.membersCount ?? 1)
														}
														className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
													>
														<Plus className="w-4 h-4" />
													</button>
												</div>
											</div>
											{ticket.description && (
												<>
													<hr className="my-2" />
													<p className="text-sm text-gray-500">{ticket.description}</p>
												</>
											)}
										</div>
									))}
								</div>
								<div className="flex justify-end">
									<div className="space-y-">
										<button
											onClick={() => {
												if (!isUserLoggedIn) {
													toast.error("Please login to continue");
													router.push("/login?redirect=/event/checkout/" + eventData.id);
													return;
												}

												if (eventData.vendorId === session?.user.id) {
													toast.error("The owner cannot book their own sports.");
													return;
												}

												if (totalTickets === 0) {
													setShowTicketError(true);
												} else {
													setCurrentStep(2);
													setIsOpenStep2(true);
													setIsOpenStep1(false);
													setShowTicketError(false);
												}
											}}
											className=" bg-[#C69C72] text-white py-3 px-4 rounded-lg mt-6 hover:bg-[#B38B61] transition-colors"
										>
											{isUserLoggedIn ? "Continue" : "Please Login to Continue"}
										</button>
									</div>
								</div>
								{showTicketError && (
									<p className="text-sm text-red-500 text-center">
										Please select at least one ticket to continue
									</p>
								)}
							</>
						)}
					</div>
				</div>

				<div className="md:hidden md:col-span-1">
					<BookingTicketSummary
						eventData={eventData}
						selectedSlot={selectedSlot}
						setSelectedSlot={setSelectedSlot}
						totalTickets={totalTickets}
						totalAmount={displayTotalAmount} // Using display amount for UI only
						selectedTickets={selectedTickets}
						tickets={tickets}
					/>
				</div>
				{/* Step 2: Ticket Details */}

				<div className={`bg-white rounded-3xl border shadow-sm overflow-hidden`}>
					<div className="p-6">
						<div
							onClick={() => setIsOpenStep2(!isOpenStep2)}
							className="flex justify-between items-start mb-6 cursor-pointer"
						>
							<div>
								<div className="text-sm text-gray-500 mb-1">Step 2.</div>
								<h2 className="text-xl font-semibold text-gray-900">Ticket Details</h2>
								<p className="text-sm text-gray-500 mt-1">
									These details will be shown on your invoice*
								</p>
							</div>
							<button
								className={`${isOpenStep2 ? "text-[#f2c8a6]" : "text-gray-400"} hover:text-gray-500`}
							>
								<CircleArrowDown className="w-6 h-6" />
							</button>
						</div>

						{isOpenStep2 && (
							<form
								onSubmit={handleSubmit(onSubmit, (err) => {
									toast.error("Please fill all the fields");
								})}
								className={`space-y-4 relative ${isUserLoggedIn ? "" : " bg-white/50"}`}
							>
								{!isUserLoggedIn && (
									<Link
										href={"/login?redirect=/event/checkout/" + eventData.id}
										className="flex absolute inset-0 z-10 text-lg font-semibold justify-center items-center backdrop-blur-[1px] bg-white/50"
									>
										<button className=" bg-[#C69C72] text-white py-3 px-4 rounded-lg mt-6 hover:bg-[#B38B61] transition-colors">
											Please login to continue
										</button>
									</Link>
								)}
								{totalTickets > 0 && renderMemberFields()}

								{/* Terms and Conditions */}
								<div className="flex items-center mt-6">
									<input
										id="acceptedTerms"
										type="checkbox"
										{...register("acceptedTerms")}
										className={`h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 ${
											errors.acceptedTerms ? "border-red-500" : ""
										}`}
									/>
									<label
										htmlFor="acceptedTerms"
										className="ml-2 text-sm md:text-base text-gray-500 cursor-pointer"
									>
										I have read and accepted the{" "}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Link
													href="#"
													className="text-gray-700 underline outline-offset-2 outline-1 outline-gray-400"
												>
													terms & conditions
												</Link>
											</AlertDialogTrigger>
											<AlertDialogContent className="md:min-w-[800px]">
												<AlertDialogHeader>
													<AlertDialogTitle className="text-xl">
														Terms and Conditions
													</AlertDialogTitle>
													<AlertDialogDescription className="px-4 py-2 max-h-[75vh] overflow-y-auto">
														<h1 className="title text-lg">User Agreement</h1>
														<ol className="sub-title text-left list-decimal px-6 overflow-y-auto">
															{appTermsAndConditions.map((text, idx) => (
																<li key={idx}>{text}</li>
															))}
														</ol>
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter className="flex gap-4">
													<AlertDialogCancel>Close</AlertDialogCancel>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</label>
								</div>
								{errors.acceptedTerms && (
									<p className="text-xs text-red-500">{errors.acceptedTerms.message}</p>
								)}

								{/* Pay Now Button */}
								<button
									type="submit"
									disabled={isLoading}
									className="w-full flex justify-center items-center bg-[#C69C72] text-white py-3 rounded-lg mt-6 hover:bg-[#B38B61] transition-colors"
								>
									{isLoading ? <LoaderCircle className="animate-spin" /> : "Pay Now"}
								</button>
							</form>
						)}
					</div>
				</div>
			</div>

			{/* Right Column - Booking Summary */}
			<div className="hidden md:block md:col-span-1">
				<BookingTicketSummary
					eventData={eventData}
					selectedSlot={selectedSlot}
					setSelectedSlot={setSelectedSlot}
					totalTickets={totalTickets}
					totalAmount={displayTotalAmount} // Using display amount for UI only
					selectedTickets={selectedTickets}
					tickets={tickets}
				/>
			</div>
		</div>
	);
}
