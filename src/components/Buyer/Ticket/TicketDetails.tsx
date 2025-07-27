"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { Loader, MessageCircleIcon, Siren } from "lucide-react";
import { useSession } from "next-auth/react";
import { trpc } from "@/app/provider";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { notFound } from "next/navigation";
import ShareEvent from "@/components/common/Event/ShareEvent";
import RateEvent from "@/components/common/Event/RateEvent";

export default function TicketDetails({ bookingId }: { bookingId: string }) {
	const { data: session } = useSession();

	const { data: bookingData, isLoading } = trpc.booking.getBookingById.useQuery({ bookingId: bookingId });

	if (isLoading) {
		return (
			<div className="w-full flex justify-center items-center h-[90vh]">
				<Loader className="w-10 h-10 animate-spin" />
			</div>
		);
	}

	if (!bookingData || bookingData.status !== "SUCCESS" || bookingData.userId !== session?.user?.id) {
		return notFound();
	}

	return (
		<div className="">
			<Card className="overflow-hidden">
				<CardHeader className="p-0">
					{bookingData?.event?.images && bookingData?.event?.images[0] ? (
						<div className="relative md:h-[500px] aspect-video rounded-md">
							<Image
								src={bookingData?.event?.images[0]}
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
				<CardContent className="p-6">
					<div className="grid gap-8 md:grid-cols-2">
						{/* Left Column */}
						<div className="space-y-6">
							<h1 className="text-2xl font-bold">{bookingData?.event?.title}</h1>
							{bookingData?.event?.host && (
								<div className="space-y-2">
									<h2 className="font-semibold">Hosted By</h2>
									<p className="text-base text-muted-foreground">{bookingData?.event?.host}</p>
								</div>
							)}
							{bookingData?.event?.description && (
								<div className="space-y-2">
									<h2 className="font-semibold">Description</h2>
									<p className="text-base text-muted-foreground break-words">
										{bookingData?.event?.description}
									</p>
								</div>
							)}

							{bookingData?.event?.eventSpecificType && (
								<div className="space-y-2">
									<h2 className="font-semibold">Event Type</h2>
									<p className="text-base text-muted-foreground">
										{bookingData?.event?.eventSpecificType}
									</p>
								</div>
							)}
							{bookingData?.event?.sportType && (
								<div className="space-y-2">
									<h2 className="font-semibold">Sport Type</h2>
									<p className="text-base text-muted-foreground">{bookingData?.event?.sportType}</p>
								</div>
							)}
							{bookingData?.event?.tags && (
								<div className="space-y-2">
									<h2 className="font-semibold">Tag</h2>
									<p className="text-base text-muted-foreground">{bookingData?.event?.tags}</p>
								</div>
							)}

							{bookingData?.event?.eventType && (
								<div className="space-y-2">
									<h2 className="font-semibold">Event Name</h2>
									<p className="text-base text-muted-foreground">{bookingData?.event?.eventType}</p>
								</div>
							)}

							{bookingData?.event?.isTeamEvent && (
								<div className="space-y-2">
									<h2 className="font-semibold">Team Size</h2>
									<p className="text-base text-muted-foreground">{bookingData?.event?.teamSize}</p>
								</div>
							)}

							{bookingData?.event?.termsAndConditions && (
								<div className="space-y-2">
									<h2 className="font-semibold">Terms & Conditions</h2>
									<p className="text-base text-muted-foreground">
										{bookingData?.event?.termsAndConditions}
									</p>
								</div>
							)}

							{bookingData?.paymentId && (
								<div className="space-y-2">
									<h2 className="font-semibold">Payment ID</h2>
									<p className="text-base text-muted-foreground">{bookingData?.paymentId}</p>
								</div>
							)}

							<div className="space-y-2">
								{bookingData?.bookedSlot?.date && (
									<>
										{moment(bookingData.bookedSlot.date).isBefore(moment(), "day") ? (
											<>
												<h2 className="font-semibold">Your review</h2>
												<RateEvent
													eventId={bookingData.eventId}
													existingRating={(bookingData.event.reviews[0] as any) || {}}
												/>
											</>
										) : moment(bookingData.bookedSlot.date).isSame(moment(), "day") ? (
											<>
												<h2 className="font-semibold">Date left</h2>
												<div className="text-base text-muted-foreground flex gap-1 items-center justify-center">
													<Siren className="h-4 w-4" />
													<span>Event is today!</span>
												</div>
											</>
										) : (
											<>
												<h2 className="font-semibold">Date left</h2>
												<section className="text-base text-muted-foreground">
													{moment(bookingData.bookedSlot.date)
														.startOf("day")
														.diff(moment().startOf("day"), "days")}{" "}
													days left
												</section>
											</>
										)}
									</>
								)}
								{/* <RateEvent
									eventId={bookingData.eventId}
									existingRating={(bookingData.event.reviews[0] as any) || {}}
									showComment={true}
								/> */}
							</div>
						</div>

						{/* Right Column */}
						<div className="space-y-6">
							<div className="space-y-2">
								<h2 className="font-semibold">Organizer Details</h2>
								<p className="text-base text-muted-foreground">
									{bookingData?.event?.users?.firstName} {bookingData?.event?.users?.lastName}
								</p>
								<p className="text-base text-muted-foreground">{bookingData?.event?.users?.email}</p>
								{/* <p className="text-base text-muted-foreground">{bookingData?.event?.users?.mobileNumber}</p> */}
							</div>

							{/* amount */}
							<div className="space-y-2">
								<h2 className="font-semibold">Amount Paid</h2>
								<p className="text-base text-muted-foreground">₹{bookingData?.totalAmount}</p>
							</div>

							<div className="space-y-2">
								<h2 className="font-semibold">Slot Details</h2>
								<table className="w-full border-collapse">
									<tbody>
										<tr className="border-b">
											<td className="py-2 font-normal">Date</td>
											<td className="py-2 text-base text-muted-foreground">
												{bookingData?.bookedSlot?.date}
											</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 font-normal">Time</td>
											<td className="py-2 text-base text-muted-foreground">
												{(bookingData?.bookedSlot?.slot as any)?.startTime} -{" "}
												{(bookingData?.bookedSlot?.slot as any)?.endTime}
											</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 font-normal">Booked Seats</td>
											<td className="py-2 text-base text-muted-foreground">
												{bookingData?.bookedSlot?.bookedSeats}
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div className="space-y-2">
								<h2 className="font-semibold">Member Details</h2>

								{bookingData?.members && (
									<table className="w-full table-auto border-collapse">
										<thead>
											<tr className="border-b">
												<th className="text-left font-normal p-2">Name</th>
												<th className="text-left font-normal p-2">Email</th>
												<th className="text-left font-normal p-2">Phone</th>
											</tr>
										</thead>
										<tbody>
											{bookingData.members.map((member: any, idx) => (
												<tr key={idx} className="border-b">
													<td className="py-2 text-base text-muted-foreground">
														{member.name}
													</td>
													<td className="py-2 text-base text-muted-foreground">
														{member.email}
													</td>
													<td className="py-2 text-base text-muted-foreground">
														{member.phone}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>

							<div className="space-y-2">
								<h2 className="font-semibold">Location</h2>
								{bookingData?.event?.isOnline ? (
									<>
										<p className="text-base text-muted-foreground">Online Event</p>
										{bookingData?.event?.location?.startsWith("http") ||
										bookingData?.event?.location?.startsWith("https") ? (
											<a
												href={bookingData?.event?.location}
												target="_blank"
												rel="noopener noreferrer"
												className="text-base text-blue-500 hover:underline"
											>
												{bookingData?.event?.location}
											</a>
										) : (
											<p className="text-base text-muted-foreground">
												{bookingData?.event?.location}
											</p>
										)}
									</>
								) : (
									<>
										<p className="text-base text-muted-foreground">
											{bookingData?.event?.location}
										</p>
										{bookingData?.event?.landmark && (
											<div className="space-y-2">
												<p className="text-base text-muted-foreground">
													{bookingData?.event?.landmark}
												</p>
											</div>
										)}

										<p className="text-base text-muted-foreground">
											{bookingData?.event?.city}, {bookingData?.event?.state},{" "}
											{bookingData?.event?.country} - {bookingData?.event?.pincode}
										</p>
									</>
								)}
							</div>

							{bookingData?.orderId && (
								<div className="space-y-2">
									<h2 className="font-semibold">Order ID</h2>
									<p className="text-base text-muted-foreground">{bookingData?.orderId}</p>
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4 justify-center mt-8">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="custom">QR</Button>
							</DialogTrigger>
							<DialogContent className="max-w-[700px]">
								<DialogHeader>
									<DialogTitle>Booking Details</DialogTitle>
								</DialogHeader>
								<div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-4 p-4">
									<div className="text-left col-span-2 pe-4">
										<table className="w-full border-collapse" border={1}>
											<tbody>
												{/* <tr className="border-b py-2 ">
                                                    <td className="font-normal py-1  pr-4">Booking ID:</td>
                                                    <td>{bookingData?.id}</td>
                                                </tr>
                                                <tr className="border-b py-2 ">
                                                    <td className="font-normal py-1  pr-4">Event ID:</td>
                                                    <td>{bookingData?.event?.id}</td>
                                                </tr> */}
												{bookingData?.orderId && (
													<tr className="border-b py-2 ">
														<td className="font-normal py-1  pr-4">Order ID:</td>
														<td>{bookingData?.orderId}</td>
													</tr>
												)}
												{bookingData?.paymentId && (
													<tr className="border-b py-2 ">
														<td className="font-normal py-1  pr-4">Payment ID:</td>
														<td>{bookingData?.paymentId}</td>
													</tr>
												)}
												<tr className="border-b py-2 ">
													<td className="font-normal py-1 pr-4">Event Name:</td>
													<td>{bookingData?.event?.title}</td>
												</tr>
												<tr className="border-b">
													<td className="font-normal py-1  pr-4">Booking Date:</td>
													<td>{moment(bookingData?.createdAt).format("DD MMMM YYYY")}</td>
												</tr>
												<tr className="border-b">
													<td className="font-normal py-1  pr-4">Booked Slot Date:</td>
													<td>{bookingData?.bookedSlot?.date}</td>
												</tr>
												<tr className="border-b">
													<td className="font-normal py-1  pr-4">Booked Slot Time:</td>
													<td>
														{(bookingData?.bookedSlot?.slot as any)?.startTime} -{" "}
														{(bookingData?.bookedSlot?.slot as any)?.endTime}
													</td>
												</tr>
												<tr className="border-b">
													<td className="font-normal py-1  pr-4">Total Seats:</td>
													<td>{bookingData?.bookedSlot?.bookedSeats}</td>
												</tr>
												<tr className="border-b">
													<td className="font-normal py-1  pr-4">Total Amount:</td>
													<td>{bookingData?.totalAmount}</td>
												</tr>
												<tr className="border-b">
													<td className="font-normal py-1  pr-4">Payment Status:</td>
													<td>{bookingData?.status}</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div className="flex justify-center flex-col items-center">
										<QRCode value={bookingData?.id} size={200} />
										<p className="text-sm text-muted-foreground mt-2">
											Show this QR code at the venue
										</p>
									</div>
								</div>
							</DialogContent>
						</Dialog>
						<ShareEvent eventId={bookingData.eventId} />
						{/* chat icon */}
						<Link
							href={
								session?.user?.role === "BUYER"
									? `/buyer/messages?receiverId=${bookingData?.event?.users?.id}&eventId=${bookingData?.event?.id}&eventName=${bookingData?.event?.title.split(" ").join("-")}`
									: `/vendor/dashboard/messages?receiverId=${bookingData?.event?.users?.id}&eventId=${bookingData?.event?.id}&eventName=${bookingData?.event?.title.split(" ").join("-")}`
							}
						>
							<Button variant="outline">
								<MessageCircleIcon className="w-4 h-4" /> Chat with Host
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
