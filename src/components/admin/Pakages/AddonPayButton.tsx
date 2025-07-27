"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import { IEvent } from "@/types/event.type";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { CircleCheckBig, Search } from "lucide-react";

interface IPackage {
	id: string;
	title: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	currency: string;
	price: number;
}

export default function AddonPayButton() {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState<IPackage | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [step, setStep] = useState(1); // 1: Select Event, 2: Select Package
	const queryClient = useQueryClient();

	const { data: session } = useSession();

	// Fetch events if not provided as props
	const { data: eventsData, isLoading: isEventsLoading } = trpc.event.getEvents.useInfiniteQuery(
		{
			isCurrUserSpecific: true,
			status: "PUBLISHED",
			timeFilter: "all_time",
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			keepPreviousData: false,
		},
	);

	const processedEvents = React.useMemo(() => {
		if (!eventsData?.pages) return [];
		return eventsData.pages.flatMap((page) => page.items);
	}, [eventsData]);

	const { data: packagesData, isLoading: isPackagesLoading } = trpc.promotion.getAddonPackages.useQuery(
		{
			page: 1,
			limit: 10,
			sortBy: "price",
			sortOrder: "asc",
		},
		{
			enabled: step === 2, // Only fetch packages when in step 2
			onSuccess: (data) => {
				setSelectedPackage(data.data[0] as any);
			},
			onError: (error) => {
				toast.error("Failed to load promotion packages");
				console.error("Error loading packages:", error);
			},
		},
	);

	// Set pre-selected event if provided

	const handlePromote = async () => {
		if (!selectedEvent) {
			toast.error("Please select an event to promote");
			return;
		}

		if (!selectedPackage) {
			toast.error("Please select a package to promote");
			return;
		}

		const formData = {
			userId: session?.user?.id!,
			eventId: selectedEvent.id!,
			packageId: selectedPackage.id,
			totalAmount: selectedPackage.price,
		};
		setIsLoading(true);

		try {
			const res = await fetch("/api/create-addon-order", {
				method: "POST",
				body: JSON.stringify({ addonPackageData: formData }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to create order");
			}

			setOpen(false);

			const paymentData = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				order_id: data.order.id,

				handler: async function (response: any) {
					// verify payment
					const res = await fetch("/api/verify-addon-order", {
						method: "POST",
						body: JSON.stringify({
							orderId: response.razorpay_order_id,
							razorpayPaymentId: response.razorpay_payment_id,
							razorpaySignature: response.razorpay_signature,
						}),
					});
					const data = await res.json();
					if (data.isOk) {
						toast.success("Payment successful");
						setOpen(false);
						queryClient.invalidateQueries(trpc.event.getEvents.getQueryKey({}));
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

	// Get the list of events (either from props or from the query)
	// Filter events based on search query
	const filteredEvents = processedEvents.filter(
		(event) =>
			event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.state?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Handle event selection and move to next step
	const handleEventSelect = (event: IEvent) => {
		setSelectedEvent(event);
		setStep(2);
	};

	// Go back to event selection
	const handleBackToEvents = () => {
		setStep(1);
	};

	if (isEventsLoading) {
		return <div>Loading events...</div>;
	}

	const isEventPaid =
		selectedEvent?.addonPayment &&
		selectedEvent.addonPayment.length > 0 &&
		selectedEvent.addonPayment[selectedEvent.addonPayment.length - 1].status === "SUCCESS";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Button>Select Event & Pay</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0 gap-0" autoFocus={false}>
				{step === 1 ? (
					<div className="p-6 space-y-4">
						<h2 className="text-xl font-semibold">Select an Event to Promote</h2>

						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<Input
								placeholder="Search events by title, city or state..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
							{filteredEvents.length > 0 ? (
								filteredEvents.map((event) => (
									<div
										key={event.id}
										onClick={() => handleEventSelect(event as any)}
										className="bg-white rounded-xl w-[350px] overflow-hidden border cursor-pointer hover:shadow-md transition-shadow"
									>
										<div className="relative aspect-video">
											<Image
												src={(event?.images && event?.images[0]!) || "/placeholder.svg"}
												alt={event.title!}
												fill
												className="object-cover aspect-video"
											/>
											{event.status === "PUBLISHED" && (
												<Badge className="absolute top-4 right-4 bg-blue-600 text-white">
													• Live
												</Badge>
											)}
											{event.addonPayment &&
												event.addonPayment.length > 0 &&
												event.addonPayment[event.addonPayment.length - 1].status ===
													"SUCCESS" && (
													<div className="absolute top-4 left-4 bg-green-500 text-white p-1 rounded-full">
														<CircleCheckBig size={20} />
													</div>
												)}
										</div>
										<div className="p-4 space-y-2">
											<h3 className="font-semibold text-lg">{event.title}</h3>
											<div className="space-y-1 text-xs text-gray-600">
												<p>
													{event.multipleDays
														? `${moment(event.startDate).format("DD, MMM YYYY")} - ${moment(event.endDate).format("DD, MMM YYYY")}`
														: moment(event.startDate).format("DD, MMM YYYY")}
												</p>
												<p>
													{event.landmark}, {event.city}, {event.state}
												</p>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="col-span-2 text-center py-10 text-gray-500">
									No events found matching your search criteria.
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="grid md:grid-cols-2 h-full">
						{/* Left Section - Package Selection */}
						<div className="p-6 space-y-6">
							<div className="flex items-start justify-between gap-1">
								<h2 className="text-xl font-semibold">
									{isEventPaid ? "Add-on Package Done" : "Select Add-on Package"}
								</h2>
								<Button variant="ghost" size="sm" onClick={handleBackToEvents}>
									← Back
								</Button>
							</div>

							{isPackagesLoading ? (
								<div>Loading packages...</div>
							) : (
								<div className="space-y-3">
									{packagesData?.data.map((pkg, idx) => (
										<button
											key={idx}
											onClick={() => setSelectedPackage(pkg as any)}
											className={`capitalize w-full text-left px-4 py-3 rounded-lg transition-colors
                      ${selectedPackage?.id === pkg.id ? "bg-[#C19A6B] text-white" : "bg-gray-50 hover:bg-gray-100"}`}
										>
											{pkg.title}
										</button>
									))}
								</div>
							)}

							<div className="space-y-2">
								<label className="text-sm font-medium">Price</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
									<Button variant={"outline"} className="pl-7 border w-1/2 border-[#C19A6B] text-2xl">
										{selectedPackage?.price}
									</Button>
								</div>
							</div>

							<Button
								onClick={handlePromote}
								className="w-full bg-black hover:bg-black/90 text-white"
								disabled={isLoading || isEventPaid}
							>
								{isLoading ? "Loading..." : isEventPaid ? "Already Promoted" : "Promote"}
							</Button>

							<div className="space-y-4">
								<h3 className="text-lg font-semibold capitalize">{selectedPackage?.title}</h3>
								<div className="space-y-2">
									<p className="text-base text-gray-600">Services Included:</p>
									<div className="text-base">{selectedPackage?.description}</div>
								</div>
							</div>
						</div>

						{/* Right Section - Selected Event Card */}
						<div className="bg-gray-50 p-6">
							<div className="bg-white rounded-xl overflow-hidden border">
								<div className="relative aspect-square">
									<Image
										src={(selectedEvent?.images && selectedEvent?.images[0]!) || "/placeholder.svg"}
										alt={selectedEvent?.title!}
										fill
										className="object-cover"
									/>
									{selectedEvent?.status === "PUBLISHED" && (
										<Badge className="absolute top-4 right-4 bg-blue-600 text-white">• Live</Badge>
									)}
									{isEventPaid && (
										<div className="absolute top-4 left-4 bg-green-500 text-white p-2 rounded-full">
											<CircleCheckBig size={20} />
										</div>
									)}
								</div>
								<div className="p-4 space-y-2">
									<h3 className="font-semibold text-xl">{selectedEvent?.title}</h3>
									<div className="space-y-1 text-sm text-gray-600">
										<p>
											{selectedEvent?.multipleDays
												? `${moment(selectedEvent?.startDate).format("DD, MMM YYYY")} - ${moment(selectedEvent?.endDate).format("DD, MMM YYYY")}`
												: moment(selectedEvent?.startDate).format("DD, MMM YYYY")}
										</p>
										<p>
											from {selectedEvent?.startingTime} to {selectedEvent?.endingTime}
										</p>
										<p>
											{selectedEvent?.landmark}, {selectedEvent?.city}, {selectedEvent?.state}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
