import { JsonValue } from "@prisma/client/runtime/library";
import { IBookingChart, IEvent } from "./event.type";
import { IUser } from "./user.type";

interface IBooking {
	id: string;
	userId: string;
	eventId: string;
	isGroupBooking: boolean;
	members: any[];
	totalAmount: number;
	tickets: ITicket[];
	bookingChartId?: string | null;
	currency?: string;
	status: string;
	paymentId: string | null;
	orderId: string;
	createdAt: Date;
	updatedAt: Date;
	totalAmountWithTax: number;
	currencyIcon?: string;
	event?: IEvent | null;
	bookedSlot?: IBookingChart | null;
	user?: IUser | null;
}

export interface ITicket {
	ticketId: string;
	quantity: number;
}

export type { IBooking };
