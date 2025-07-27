"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import moment from "moment";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { trpc } from "@/app/provider";
import { useRouter } from "next/navigation";
import lodash from "lodash";
import { Loader } from "lucide-react";

export default function EventFullDetails({ params }: { params: { paymentId: string } }) {
	const { data: session } = useSession();
	const { data: eventData, isLoading } = trpc.promotion.getPromotedEventById.useQuery(
		{
			id: params.paymentId,
		},
		{
			enabled: !!params.paymentId,
		},
	);
	const router = useRouter();

	if (isLoading) {
		return (
			<div className="min-h-screen grid place-content-center">
				<Loader className="animate-spin" />
			</div>
		);
	}

	return (
		<div className="">
			<div className="flex justify-between items-center pb-4">
				<h1 className="text-2xl font-medium">Event Promoted Detail Page</h1>
				<div className="flex gap-4">
					<Button variant="outline" onClick={() => router.back()}>
						Back
					</Button>
				</div>
			</div>
			<Card className="overflow-hidden">
				<CardHeader className="p-0">
					{eventData?.event?.images && eventData?.event?.images[0] ? (
						<div className="relative md:h-[500px] aspect-video rounded-md">
							<Image
								src={eventData?.event?.images[0]}
								alt="banner"
								fill
								className="object-cover rounded-md"
								priority
							/>
						</div>
					) : (
						"No image"
					)}
				</CardHeader>
				<CardContent className="p-6 text-lg">
					<div className="grid gap-8 md:grid-cols-2">
						{/* Left Column */}
						<div className="space-y-6">
							<h1 className="text-2xl font-bold capitalize">{eventData?.event.title}</h1>
							{eventData?.event.host && (
								<div className="space-y-2">
									<h2 className="font-semibold">Hosted By</h2>
									<p className="text-base text-muted-foreground">{eventData?.event.host}</p>
								</div>
							)}
							{eventData?.event.description && (
								<div className="space-y-2">
									<h2 className="font-semibold">Description</h2>
									<p className="text-base text-muted-foreground break-words">
										{eventData?.event.description}
									</p>
								</div>
							)}

							{eventData?.event.eventSpecificType && (
								<div className="space-y-2">
									<h2 className="font-semibold">Sport Category</h2>
									<p className="text-base text-muted-foreground">
										{lodash.capitalize(eventData?.event.eventSpecificType)}
									</p>
								</div>
							)}
							{eventData?.event.sportType && (
								<div className="space-y-2">
									<h2 className="font-semibold">Sport Type</h2>
									<p className="text-base text-muted-foreground">{eventData?.event.sportType}</p>
								</div>
							)}
							{eventData?.event.tags && (
								<div className="space-y-2">
									<h2 className="font-semibold">Tag</h2>
									<p className="text-base text-muted-foreground">{eventData?.event.tags}</p>
								</div>
							)}

							{eventData?.event?.eventSpecificType && (
								<div className="space-y-2">
									<h2 className="font-semibold">
										{lodash.capitalize(eventData?.event?.eventSpecificType)} Type
									</h2>
									<p className="text-base text-muted-foreground">{eventData?.event?.eventType}</p>
								</div>
							)}

							{eventData?.event.termsAndConditions && (
								<div className="space-y-2">
									<h2 className="font-semibold">Terms & Conditions</h2>
									<p className="text-base text-muted-foreground">
										{eventData?.event.termsAndConditions}
									</p>
								</div>
							)}
						</div>

						{/* Right Column */}
						<div className="space-y-6">
							{
								<div className="space-y-2">
									<h2 className="font-semibold">Featured Status</h2>
									<p className="text-base text-muted-foreground">
										{eventData?.event.featured !== null
											? "Featured on " +
												moment(eventData?.event.featured?.updatedAt).format(
													"DD MMMM YYYY, hh:mm a",
												)
											: "Waiting for approval"}
									</p>
								</div>
							}

							<div className="space-y-2">
								<h2 className="font-semibold">Date</h2>
								{eventData?.event.multipleDays ? (
									<div className="flex flex-col gap-2">
										<p className="text-base text-muted-foreground">
											{moment(eventData?.event.startDate).format("DD MMMM YYYY")} -{" "}
											{moment(eventData?.event.endDate).format("DD MMMM YYYY")}
										</p>
										<p className="text-base text-muted-foreground">
											{eventData?.event?.weekDays?.join(", ")}
										</p>
									</div>
								) : (
									<p className="text-base text-muted-foreground">
										{moment(eventData?.event.startDate).format("DD MMMM YYYY")}
									</p>
								)}
							</div>

							{eventData?.event.startingTime && (
								<div className="space-y-2">
									<h2 className="font-semibold">Opening Time</h2>
									<p className="text-base text-muted-foreground">{eventData?.event.startingTime}</p>
								</div>
							)}

							{eventData?.event.endingTime && (
								<div className="space-y-2">
									<h2 className="font-semibold">Closing Time</h2>
									<p className="text-base text-muted-foreground">{eventData?.event.endingTime}</p>
								</div>
							)}

							{eventData?.orderId && (
								<div className="space-y-2">
									<h2 className="font-semibold">Order Id</h2>
									<p className="text-base text-muted-foreground">{eventData?.orderId}</p>
								</div>
							)}

							{eventData?.paymentId && (
								<div className="space-y-2">
									<h2 className="font-semibold">Payment Id</h2>
									<p className="text-base text-muted-foreground">{eventData?.paymentId}</p>
								</div>
							)}

							{eventData?.createdAt && (
								<div className="space-y-2">
									<h2 className="font-semibold">Created At</h2>
									<p className="text-base text-muted-foreground">
										{moment(eventData?.createdAt).format("DD, MMM YYYY HH:mm a")}
									</p>
								</div>
							)}

							{eventData?.status && (
								<div className="space-y-2">
									<h2 className="font-semibold">Status</h2>
									<p className="text-base text-muted-foreground">{eventData?.status}</p>
								</div>
							)}

							{eventData?.event_promotion_packages && (
								<div className="space-y-2">
									<h2 className="font-semibold">Promotion Package Selected</h2>
									<p className="text-base text-muted-foreground capitalize">
										{eventData?.event_promotion_packages.packageName}
									</p>
									<p className="text-base text-muted-foreground">
										₹ {eventData?.event_promotion_packages.packagePrice.toString()}
									</p>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
