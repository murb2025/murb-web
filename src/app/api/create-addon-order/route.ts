import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/server/db";
import { PaymentStatus } from "@prisma/client";

const razorpay = new Razorpay({
	key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
	key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export async function POST(req: Request) {
	const { addonPackageData } = await req.json();
	try {
		const event = await prisma.events.findUnique({
			where: { id: addonPackageData.eventId },
		});

		if (!event) {
			throw new Error("Event not found.");
		}

		const promotionPackageFound = await prisma.event_addon_packages.findUnique({
			where: {
				id: addonPackageData.packageId,
			},
		});

		if (!promotionPackageFound) {
			throw new Error("promotion Package not found.");
		}

		const order = await razorpay.orders.create({
			amount: addonPackageData.totalAmount * 100,
			currency: "INR",
		});

		// create bookings in db

		const booking = await prisma.addonPayment.create({
			data: {
				totalAmount: parseFloat(addonPackageData.totalAmount),
				status: PaymentStatus.PENDING,
				orderId: order.id,
				user: {
					connect: {
						id: addonPackageData.userId,
					},
				},
				event: {
					connect: {
						id: addonPackageData.eventId,
					},
				},
				event_addon_packages: {
					// Connect the required relation properly
					connect: {
						id: addonPackageData.packageId,
					},
				},
			},
		});

		return NextResponse.json({ order, booking });
	} catch (error: any) {
		return NextResponse.json({ message: error.message, isOk: false }, { status: 400 });
	}
}
