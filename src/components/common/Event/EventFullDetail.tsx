import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IEvent } from "@/types/event.type";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { trpc } from "@/app/provider";
import { isAdminEmail } from "@/utils/helper";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ShareEvent from "./ShareEvent";
import EventReviews from "./EventReviews";
import lodash from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import { sortDaysOfWeek } from "@/utils/events";
import {
	MapPin,
	Calendar,
	Clock,
	Users,
	Tag,
	Star,
	Bike,
	Dumbbell,
	Check,
	Drama,
	Home,
	MapPinHouse,
	User,
} from "lucide-react";

export default function EventFullDetails({
	data,
	isBookingPage = false,
}: {
	data: Partial<IEvent>;
	isBookingPage?: boolean;
}) {
	const [eventStatus, setEventStatus] = useState(data.status);
	const { data: session } = useSession();
	const [showMoreSlots, setShowMoreSlots] = useState(false);
	const isUserLoggedIn = !!session;
	const isEventOwner = session?.user.id === data.vendorId;
	const { mutateAsync: publishEvent } = trpc.admin.publish.useMutation();

	useEffect(() => {
		setEventStatus(data.status);
	}, [data.status]);

	const queryClient = useQueryClient();

	// Calculate average rating if available
	const avgRating =
		data.reviews && data.reviews.length > 0
			? data.reviews.reduce((sum, review) => sum + review.rating, 0) / data.reviews.length
			: 0;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
			{/* Images Gallery - Airbnb Style */}
			<div className="mb-6 rounded-xl overflow-hidden">
				{data?.images && data?.images.length > 0 ? (
					<div className="h-[75vh] relative">
						<Image
							src={data.images[0]}
							alt="main image"
							fill
							className="object-contain rounded-lg"
							priority
						/>
					</div>
				) : (
					<div className="bg-gray-200 h-96 flex items-center justify-center rounded-lg">
						<p className="text-gray-500">No images available</p>
					</div>
				)}
			</div>

			{/* Title Section - Airbnb Style */}
			<div className="mb-4">
				<div className="flex justify-between items-start">
					<h1 className="text-2xl md:text-3xl font-bold">{data.title}</h1>
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				{/* Left Column - Details */}
				<div className="col-span-1 lg:col-span-2">
					{/* Host Section */}
					<div className="border-b pb-6 mb-6">
						<div className="flex justify-between items-center">
							{/* <div>
								{data.eventType && (
									<h2 className="text-xl md:text-2xl font-bold">
										{data.eventType && `${data.eventType} event`}
										{data.isTeamEvent ? " for teams" : " for individuals"}
									</h2>
								)}
							</div> */}
							{isEventOwner && data.host && (
								<div className="flex items-center">
									<div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
										{data.host.charAt(0).toUpperCase()}
									</div>
									<div>
										<p className="font-medium">Hosted by</p>
										<p>{data.host}</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Event Details */}
					<div className="border-b pb-8 mb-8">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							{/* Date & Time */}
							<div className="flex p-4 border rounded-xl">
								<Calendar className="w-8 h-8 text-amber-700 mr-4" />
								<div>
									<h3 className="font-bold">{data.multipleDays ? "Recurring Week Days" : "Date"}</h3>
									{data.multipleDays ? (
										<p className="text-gray-700">
											{sortDaysOfWeek(data?.weekDays || []).join(", ")}
										</p>
									) : (
										<p className="text-gray-700">{moment(data.startDate).format("DD MMMM YYYY")}</p>
									)}
								</div>
							</div>
							<div className="flex p-4 border rounded-xl">
								<Clock className="w-8 h-8 text-amber-700 mr-4" />
								<div>
									<h3 className="font-bold">Opening & Closing Time</h3>
									{data.isHaveSlots ? (
										<p className="text-gray-700 mt-1">Multiple slots available</p>
									) : data.endingTime === "24:00" ? (
										<p className="text-gray-700 mt-1">All Day on recurring days</p>
									) : (
										<p className="text-gray-700 mt-1">
											{data.startingTime} - {data.endingTime}
										</p>
									)}
								</div>
							</div>
							{/* Location */}
							<div className="flex p-4 border rounded-xl">
								{data.isHomeService ? (
									<MapPinHouse className="w-8 h-8 text-amber-700 mr-4" />
								) : (
									<MapPin className="w-8 h-8 text-amber-700 mr-4" />
								)}
								<div>
									<h3 className="font-bold">Location</h3>
									{data.isOnline ? (
										<p className="text-gray-700">Online Event</p>
									) : (
										<p className="text-gray-700">
											{data.landmark && `${data.landmark}, `}
											{data.city}, {data.state}
										</p>
									)}
								</div>
							</div>
							{/* Home Service */}
							{data.isHomeService && (
								<div className="flex p-4 border rounded-xl">
									<Home className="w-8 h-8 text-amber-700 mr-4" />
									<div>
										<h3 className="font-bold">Home Service</h3>
										<p className="text-gray-700">Available at your home</p>
									</div>
								</div>
							)}
							{/* Sport Details */}
							<div className="flex p-4 border rounded-xl">
								<Tag className="w-8 h-8 text-amber-700 mr-4" />
								<div>
									<h3 className="font-bold">Sport Category</h3>
									{data.eventSpecificType && (
										<p className="text-gray-700 capitalize">
											{lodash.capitalize(data.eventSpecificType)}
										</p>
									)}
								</div>
							</div>
							{/* Sport Type */}
							<div className="flex p-4 border rounded-xl">
								<Dumbbell className="w-8 h-8 text-amber-700 mr-4" />
								<div>
									<h3 className="font-bold">Sport Type</h3>
									{data.sportType && <p className="text-gray-700 capitalize">{data.sportType}</p>}
								</div>
							</div>
							{/* Minimum Days Running */}
							{data.numberOfDays && (
								<div className="flex p-4 border rounded-xl">
									<Calendar className="w-8 h-8 text-amber-700 mr-4" />
									<div>
										<h3 className="font-bold">Number of days running per week</h3>
										<p className="text-gray-700">{data.numberOfDays} days per week</p>
									</div>
								</div>
							)}
							{/* Minimum Participants */}
							{data.minimumParticipants && (
								<div className="flex p-4 border rounded-xl">
									<Users className="w-8 h-8 text-amber-700 mr-4" />
									<div>
										<h3 className="font-bold">Minimum Participants</h3>
										<p className="text-gray-700">{data.minimumParticipants}</p>
									</div>
								</div>
							)}
							{/* Sport Tags */}
							<div className="flex p-4 border rounded-xl">
								<Bike className="w-8 h-8 text-amber-700 mr-4" />
								<div>
									<h3 className="font-bold">Sport</h3>
									{data.tags && <p className="text-gray-700 capitalize">{data.tags}</p>}
								</div>
							</div>
							{/* Event Type */}
							{data.eventType && (
								<div className="flex p-4 border rounded-xl">
									<Drama className="w-8 h-8 text-amber-700 mr-4" />
									<div>
										<h3 className="font-bold">Event Type</h3>
										<p className="text-gray-700 capitalize">{data.eventType}</p>
									</div>
								</div>
							)}
							{/* Team Info (if applicable) */}
							{data.isTeamEvent ? (
								<div className="flex p-4 border rounded-xl">
									<Users className="w-8 h-8 text-amber-700 mr-4" />
									<div>
										<h3 className="font-bold">Team Information</h3>
										<p className="text-gray-700">Team Size: {data.teamSize}</p>
										<p className="text-gray-700">
											Teams: {data.maximumParticipants ? data.maximumParticipants : "N/A"}
										</p>
									</div>
								</div>
							) : data.maximumParticipants && data.maximumParticipants > 0 ? (
								<div className="flex p-4 border rounded-xl">
									<Users className="w-8 h-8 text-amber-700 mr-4" />
									<div>
										<h3 className="font-bold">Maximum Participants</h3>
										<p className="text-gray-700 capitalize">
											{data.maximumParticipants ? data.maximumParticipants : "N/A"}
										</p>
									</div>
								</div>
							) : null}
						</div>
						{data.amenities && data.amenities?.length > 0 && (
							<div>
								<h3 className="text-xl font-bold mb-4">Amenities Provided</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
									{data.amenities?.map((amenity, idx) => (
										<div key={idx} className="flex items-center">
											<Check className="w-4 h-4 text-amber-700 mr-2" />
											<span className="text-gray-700">{amenity}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Description */}
						<div className="mt-8">
							<h3 className="text-xl font-bold mb-4">About this event</h3>
							<p className="text-gray-700 whitespace-pre-line">{data.description}</p>
						</div>
					</div>
					{/* Slot Information */}
					{data.isHaveSlots && (
						<div className="border-b pb-8 mb-8">
							<h3 className="text-xl font-bold mb-4">Available Slots</h3>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
								{data?.slots &&
									data?.slots
										.slice(0, showMoreSlots ? data?.slots?.length : 10)
										.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
										.map((slot, idx) => (
											<div
												key={idx}
												className="border border-amber-200 bg-amber-50 p-3 rounded-lg text-center"
											>
												<Clock className="w-4 h-4 mx-auto mb-1 text-amber-700" />
												<span className="text-sm font-medium">
													{new Date(`2000-01-01T${slot.start}`).toLocaleTimeString("en-US", {
														hour: "numeric",
														minute: "2-digit",
														hour12: true,
													})}{" "}
													-{" "}
													{new Date(`2000-01-01T${slot.end}`).toLocaleTimeString("en-US", {
														hour: "numeric",
														minute: "2-digit",
														hour12: true,
													})}
												</span>
											</div>
										))}
							</div>
							{data?.slots && data?.slots?.length > 10 && (
								<span
									className="text-sm text-gray-500 underline cursor-pointer"
									onClick={() => setShowMoreSlots(!showMoreSlots)}
								>
									{showMoreSlots ? "Show less" : "Show more"}
								</span>
							)}
							<div className="flex flex-wrap gap-8 mt-4">
								{data.slotDuration && (
									<div className="flex items-center">
										<Clock className="w-5 h-5 text-amber-700 mr-2" />
										<span className="text-sm">Duration: {data.slotDuration} minutes</span>
									</div>
								)}
								{data.slots?.length && (
									<div className="flex items-center">
										<Calendar className="w-5 h-5 text-amber-700 mr-2" />
										<span className="text-sm">Total Slots: {data.slots.length}</span>
									</div>
								)}
								{data.minimumParticipants && (
									<div className="flex items-center">
										<Users className="w-5 h-5 text-amber-700 mr-2" />
										<span className="text-sm">Minimum Participants: {data.minimumParticipants}</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Location Map */}
					{!data.isOnline && data.city && data.state && (
						<div className="border-b pb-8 mb-8">
							<h3 className="text-xl font-bold mb-4">Location</h3>
							<div className="rounded-lg overflow-hidden border h-80">
								<iframe
									width="100%"
									height="100%"
									style={{ border: 0, borderRadius: "8px" }}
									loading="lazy"
									allowFullScreen
									referrerPolicy="no-referrer-when-downgrade"
									src={`https://www.google.com/maps?q=${encodeURIComponent(
										`${data.landmark}, ${data.city}, ${data.state} ${data.country} ${data.pincode}`,
									)}&output=embed`}
								/>
							</div>
							<p className="mt-2 text-gray-700">
								{data.landmark && `${data.landmark}, `}
								{data.city}, {data.state}
							</p>
						</div>
					)}

					{/* Terms & Conditions */}
					{data.termsAndConditions && (
						<div className="border-b pb-8 mb-8">
							<h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
							<p className="text-gray-700">{data.termsAndConditions}</p>
						</div>
					)}

					{/* Reviews */}
					{data && data?.reviews && data?.reviews?.length > 0 && (
						<div>
							<div className="flex items-center mb-6">
								<Star className="w-6 h-6 text-amber-700 fill-amber-700 mr-2" />
								<h3 className="text-xl font-bold">
									{avgRating.toFixed(1)} · {data.reviews.length} reviews
								</h3>
							</div>
							<EventReviews data={data} />
						</div>
					)}
				</div>

				{/* Right Column - Booking Card */}
				<div className="col-span-1">
					<div className="sticky top-24">
						<Card className="overflow-hidden shadow-lg border border-gray-200">
							<CardContent className="p-6">
								<div className="mb-6">
									<h3 className="text-xl font-bold mb-1">Pricing</h3>
									<div className="flex flex-col space-y-4">
										{(data.bookingDetails || []).map((detail, idx) => (
											<div
												key={idx}
												className="p-4 border rounded-lg bg-amber-50 border-amber-200"
											>
												<div className="flex justify-between items-center mb-2">
													{/* <span className="font-medium">
														{lodash.capitalize(detail.title || detail.type)}
														{detail.type === "SINGLE" ? " (Individual)" : " (Group)"}
													</span> */}
													{detail.title ? (
														<h2 className="font-semibold">
															{lodash.capitalize(detail.title)} Package
														</h2>
													) : (
														<h2 className="font-semibold capitalize">
															{detail.type === "SUBSCRIPTION"
																? detail.months === 1
																	? "1 Month Subscription"
																	: detail.months + " Months Subscription"
																: "Ticket Price"}
														</h2>
													)}
													<span className="text-lg font-bold text-amber-800">
														{detail.currencyIcon}{" "}
														{new Intl.NumberFormat("en-IN").format(detail.amount)}
													</span>
												</div>
												<div className="text-sm text-gray-600">
													Per{" "}
													{detail.membersCount === 1
														? "Person"
														: detail.membersCount + " Person"}
												</div>
												{detail.description && (
													<p className="text-sm text-gray-600 mt-2">{detail.description}</p>
												)}
											</div>
										))}
									</div>
								</div>
								<section className="space-y-4">
									{isBookingPage && (
										<div>
											<Link href={"/event/checkout/" + data.id}>
												<Button
													onClick={() => {
														if (data.vendorId === session?.user.id) {
															toast.error("The owner cannot book their own sports.");
															return;
														}
													}}
													className="bg-amber-700 hover:bg-amber-800 text-white py-3 w-full rounded-lg font-medium"
													size="lg"
												>
													Book Now
												</Button>
											</Link>
										</div>
									)}
									{/* Admin Controls */}
									{isBookingPage &&
										isUserLoggedIn &&
										(isAdminEmail(session?.user.email || "") || session?.user.role === "ADMIN") && (
											<div className="mt-4">
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className="w-full mt-2 border-amber-700 text-amber-700"
														>
															Update Status
														</Button>
													</PopoverTrigger>
													<PopoverContent>
														<p className="font-medium mb-2">Update Status</p>
														<div className="grid gap-1">
															{["PUBLISHED", "PENDING", "UNPUBLISHED"].map((str, idx) => (
																<p
																	key={idx}
																	onClick={async () => {
																		try {
																			await publishEvent({
																				eventId: String(data.id),
																				status: str as any,
																			});
																			toast.success("Event " + str);
																			setEventStatus(str);
																			queryClient.invalidateQueries({
																				queryKey: ["events"],
																			});
																		} catch (error) {
																			toast.error("Something went wrong");
																		}
																	}}
																	className={`border px-4 py-1 rounded-md shadow-sm hover:bg-slate-400 cursor-pointer ${
																		eventStatus === str
																			? str === "PUBLISHED"
																				? "bg-green-400"
																				: "bg-yellow-400"
																			: "bg-slate-100"
																	}`}
																>
																	{str}
																</p>
															))}
														</div>
													</PopoverContent>
												</Popover>
											</div>
										)}

									{isBookingPage && <ShareEvent eventId={data.id as any} />}
								</section>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
