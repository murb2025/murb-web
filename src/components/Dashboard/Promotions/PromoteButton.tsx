"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import { IEvent } from "@/types/event.type";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

interface PromotionDialogProps {
	event: Partial<IEvent>;
}

interface IPackage {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	packageName: string;
	packageDescription: {
		title: string;
		description: string;
	}[];
	packagePrice: number;
	packageCurrency: string;
	packageDuration: number;
}

export default function PromoteButton({ event }: PromotionDialogProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState<IPackage | null>(null);
	const queryClient = useQueryClient();

	const { data: session } = useSession();

	const { data: packagesData, isLoading: isPackagesLoading } = trpc.promotion.getPromotionPackages.useQuery(
		{
			page: 1,
			limit: 10,
			sortBy: "packagePrice",
			sortOrder: "asc",
		},
		{
			onSuccess: (data) => {
				setSelectedPackage(data.data[0] as any);
			},
			onError: (error) => {
				toast.error("Failed to load promotion packages");
				console.error("Error loading packages:", error);
			},
		},
	);

	const handlePromote = async () => {
		if (!selectedPackage) {
			toast.error("Please select a package to promote");
			return;
		}

		const formData = {
			userId: session?.user?.id!,
			eventId: event.id!,
			packageId: selectedPackage.id,
			totalAmount: selectedPackage.packagePrice,
		};
		setIsLoading(true);

		try {
			const res = await fetch("/api/create-promotion-order", {
				method: "POST",
				body: JSON.stringify({ promotionPackageData: formData }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Failed to create order");
			}

			// console.log(data);

			setOpen(false);

			const paymentData = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				order_id: data.order.id,

				handler: async function (response: any) {
					// verify payment
					const res = await fetch("/api/verify-promotion-order", {
						method: "POST",
						body: JSON.stringify({
							orderId: response.razorpay_order_id,
							razorpayPaymentId: response.razorpay_payment_id,
							razorpaySignature: response.razorpay_signature,
						}),
					});
					const data = await res.json();

					if (data.isOk) {
						// do whatever page transition you want here as payment was successful
						// alert("Payment successful");
						toast.success("Payment successful");
						setOpen(false);
						queryClient.invalidateQueries(trpc.event.getEvents.getQueryKey({}));
						queryClient.invalidateQueries(trpc.promotion.getPackagePayments.getQueryKey({}));
					} else {
						alert("Payment failed");
						toast.error("Payment failed");
					}
				},
			};

			const payment = new (window as any).Razorpay(paymentData);
			payment.open();
		} catch (error: any) {
			console.error("Error booking tickets:", error.message);
			toast.error(error.message);

			const errorMessage =
				error instanceof Error
					? error.message
					: error?.response?.data?.message || "An error occurred while booking. Please try again.";
		} finally {
			setIsLoading(false);
		}
	};

	if (isPackagesLoading) {
		return <div>Loading packages...</div>;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{event.promotionPayment &&
			event.promotionPayment?.length > 0 &&
			event.promotionPayment[event.promotionPayment?.length - 1].status === "SUCCESS" ? (
				<Link
					href={`/vendor/dashboard/promotions/payment/${event.promotionPayment[event.promotionPayment?.length - 1].id}`}
					passHref
				>
					<Button variant="outline">View Status</Button>
				</Link>
			) : (
				<DialogTrigger>
					<Button className="bg-black font-medium text-white px-6 rounded-[8px] hover:bg-black/70 transition-colors">
						Promote
					</Button>
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[900px] h-[90vh] overflow-auto p-0 gap-0">
				<div className="grid md:grid-cols-2 h-full">
					{/* Left Section */}
					<div className="p-6 space-y-6 mt-4">
						<h2 className="text-xl font-semibold">Do you want to Promote this event on the website ?</h2>

						<div className="space-y-3">
							{packagesData?.data.map((pkg, idx) => (
								<button
									key={idx}
									onClick={() => setSelectedPackage(pkg as any)}
									className={`capitalize w-full text-left px-4 py-3 rounded-lg transition-colors
                    ${selectedPackage?.id === pkg.id ? "bg-[#C19A6B] text-white" : "bg-gray-50 hover:bg-gray-100"}`}
								>
									{pkg.packageName}
								</button>
							))}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Price</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
								<Button variant={"outline"} className="pl-7 border w-1/2  border-[#C19A6B] text-2xl">
									{selectedPackage?.packagePrice}
								</Button>
							</div>
						</div>

						<Button onClick={handlePromote} className="w-full bg-black hover:bg-black/90 text-white">
							{isLoading ? "Loading..." : "Promote"}
						</Button>

						<div className="space-y-4">
							<h3 className="text-xl font-semibold capitalize">{selectedPackage?.packageName}</h3>
							<div className="space-y-2">
								<p className="text-lg text-gray-600">Services Included:</p>
								<ul className="space-y-2">
									{selectedPackage?.packageDescription.map((service, index) => (
										<li key={index} className="text-base flex flex-col text-gray-600">
											<span className="capitalize inline-block font-semibold">
												{" "}
												{service.title}
											</span>
											• {service.description}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					{/* Right Section - Event Card */}
					<div className="bg-gray-50 p-6">
						<div className="bg-white rounded-xl overflow-hidden border">
							<div className="relative aspect-square">
								<Image
									src={(event?.images && event?.images[0]!) || "/placeholder.svg"}
									alt={event.title!}
									fill
									className="object-cover"
								/>
								{event.status === "PUBLISHED" && (
									<Badge className="absolute top-4 right-4 bg-blue-600 text-white">• Live</Badge>
								)}
							</div>
							<div className="p-4 space-y-2">
								<h3 className="font-semibold text-xl">{event.title}</h3>
								<div className="space-y-1 text-sm text-gray-600">
									<p>
										{event.multipleDays ? `${event.startDate} - ${event.endDate}` : event.startDate}
									</p>
									<p>
										from {event.startingTime} to {event.endingTime}
									</p>
									<p>
										{event.landmark}, {event.city}, {event.state}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
