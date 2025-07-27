import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { PaymentStatus } from "@prisma/client";
// import { sendBookingConfirmationEmail } from "@/utils/email";
import { formatDate, formatTime } from "@/utils/date";
import { sendBookingConfirmationEmail } from "@/utils/email";
import { ITicket } from "@/types/booking.type";
import { calculateAmountWithTax } from "@/constants/event.constant";
import { IBookingConfirmationPdfData, ITicketDetails } from "@/utils/email-templates/booking-confirmation";
import { IEvent } from "@/types/event.type";

const generatedSignature = (razorpayOrderId: string, razorpayPaymentId: string) => {
	const keySecret = process.env.RAZORPAY_SECRET_KEY as string;

	const sig = crypto
		.createHmac("sha256", keySecret)
		.update(razorpayOrderId + "|" + razorpayPaymentId)
		.digest("hex");
	return sig;
};

export async function POST(request: NextRequest) {
	const { orderId, razorpayPaymentId, razorpaySignature } = await request.json();

	try {
		const signature = generatedSignature(orderId, razorpayPaymentId);
		if (signature !== razorpaySignature) {
			return NextResponse.json({ message: "payment verification failed", isOk: false }, { status: 400 });
		}

		// create a event bookings
		// Get payment details
		const booking = await prisma.bookings.update({
			where: { orderId: orderId },
			data: {
				status: PaymentStatus.SUCCESS,
				paymentId: razorpayPaymentId,
			},
			include: {
				event: {
					include: {
						users: true,
					},
				},
				bookedSlot: true,
				user: true,
			},
		});

		// Delete all other pending orders for this event from this user
		await prisma.bookings.deleteMany({
			where: {
				eventId: booking.eventId,
				userId: booking.userId,
				status: PaymentStatus.PENDING,
				// orderId,
			},
		});

		// Update event total participants
		let totalTicketCnt = 0;
		for (let tick of booking.tickets) {
			totalTicketCnt += (tick as any).quantity;
		}

		await prisma.bookingChart.update({
			where: {
				id: booking?.bookingChartId!,
			},
			data: {
				bookedSeats: {
					increment: totalTicketCnt,
				},
			},
		});

		// Send booking confirmation email
		try {
			let ticketDetails: ITicketDetails[] = [];
			const bookingDetailTypeIds = booking?.tickets?.map((ticket) => (ticket as unknown as ITicket).ticketId);
			const getBookingDetailType = await prisma.booking_details_types.findMany({
				where: {
					id: {
						in: bookingDetailTypeIds,
					},
				},
			});

			for (let tick of booking?.tickets || []) {
				const ticket = getBookingDetailType.find(
					(detail) => detail.id === (tick as unknown as ITicket).ticketId,
				);
				ticketDetails.push({
					ticketName: ticket?.title ?? ticket?.type ?? "",
					description: ticket?.description ?? "",
					quantity: (tick as unknown as ITicket).quantity,
					amount: ticket?.amount ?? 0,
					currency: ticket?.currency ?? "",
					currencyIcon: ticket?.currencyIcon ?? "",
					totalAmount: (ticket?.amount ?? 0) * (tick as unknown as ITicket).quantity,
				});
			}

			const { convenienceFee, cgst, sgst } = calculateAmountWithTax(booking?.totalAmount ?? 0);

			const bookingData = {
				...booking,
				id: booking?.id ?? "",
				members: booking?.members as unknown as { name: string; email?: string | undefined; phone: string }[],
				event: booking?.event as unknown as IEvent,
				ticketDetails: ticketDetails,
				convenienceFee,
				cgst,
				sgst,
			};

			await sendBookingConfirmationEmail(
				bookingData as unknown as IBookingConfirmationPdfData,
				booking?.user?.email || "",
			);
		} catch (emailError) {
			console.error("Failed to send confirmation email:", emailError);
			// Don't fail the request if email sending fails
		}

		return NextResponse.json(
			{
				message: "payment verified successfully",
				isOk: true,
				bookingId: booking.id,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json({ message: "payment verification failed", isOk: false }, { status: 400 });
	}
}

export async function GET(request: NextRequest) {
	try {
		// create a event bookings
		// Get payment details
		const booking = await prisma.bookings.findFirst({
			where: {
				bookedSlot: {
					isNot: null,
				},
			},
			include: {
				event: {
					include: {
						users: true,
					},
				},
				bookedSlot: true,
				user: true,
			},
		});

		// calculate ticket count and amount
		let ticketDetails: ITicketDetails[] = [];
		const bookingDetailTypeIds = booking?.tickets?.map((ticket) => (ticket as unknown as ITicket).ticketId);
		const getBookingDetailType = await prisma.booking_details_types.findMany({
			where: {
				id: {
					in: bookingDetailTypeIds,
				},
			},
		});

		for (let tick of booking?.tickets || []) {
			const ticket = getBookingDetailType.find((detail) => detail.id === (tick as unknown as ITicket).ticketId);
			ticketDetails.push({
				ticketName: ticket?.title ?? ticket?.type ?? "",
				description: ticket?.description ?? "",
				quantity: (tick as unknown as ITicket).quantity,
				amount: ticket?.amount ?? 0,
				currency: ticket?.currency ?? "",
				currencyIcon: ticket?.currencyIcon ?? "",
				totalAmount: (ticket?.amount ?? 0) * (tick as unknown as ITicket).quantity,
			});
		}

		const { convenienceFee, cgst, sgst } = calculateAmountWithTax(booking?.totalAmount ?? 0);

		const bookingData = {
			...booking,
			id: booking?.id ?? "",
			members: booking?.members as unknown as { name: string; email?: string | undefined; phone: string }[],
			event: booking?.event as unknown as IEvent,
			ticketDetails: ticketDetails,
			convenienceFee,
			cgst,
			sgst,
		};

		await sendBookingConfirmationEmail(
			bookingData as unknown as IBookingConfirmationPdfData,
			booking?.user?.email || "",
		);

		return NextResponse.json(
			{
				message: "payment verified successfully",
				isOk: true,
				bookingId: booking?.id,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json({ message: "payment verification failed", isOk: false }, { status: 400 });
	}
}
