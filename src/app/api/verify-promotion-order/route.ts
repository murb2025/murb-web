import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { PaymentStatus } from "@prisma/client";

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

		// Get payment details
		const booking = await prisma.promotionPayment.update({
			where: { orderId: orderId },
			data: {
				status: PaymentStatus.SUCCESS,
				paymentId: razorpayPaymentId,
			},
			include: {
				event: true,
			},
		});

		// Delete all other pending orders for this event from this user
		await prisma.promotionPayment.deleteMany({
			where: {
				eventId: booking.eventId,
				userId: booking.userId,
				packageId: booking.packageId,
				status: PaymentStatus.PENDING,
			},
		});

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
