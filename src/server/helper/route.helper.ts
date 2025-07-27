import { IBooking } from "@/types/booking.type";

export function getDateFilterByStartDateEndDate(timeFilter: string) {
	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	// Build date filter based on timeFilter
	let dateFilter = {};
	switch (timeFilter) {
		case "today":
			dateFilter = {
				OR: [
					// For multiple days events
					{
						AND: [
							{
								startDate: {
									lte: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000).toISOString(),
								},
							},
							{
								endDate: {
									gte: startOfToday.toISOString(),
								},
							},
							{
								multipleDays: true,
							},
						],
					},
					// For single day events
					{
						AND: [
							{
								startDate: {
									gte: startOfToday.toISOString(),
									lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000).toISOString(),
								},
							},
							{
								multipleDays: false,
							},
						],
					},
				],
			};
			break;
		case "this_week":
			dateFilter = {
				OR: [
					// For multiple days events
					{
						AND: [
							{
								startDate: {
									lte: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
								},
							},
							{
								endDate: {
									gte: startOfWeek.toISOString(),
								},
							},
							{
								multipleDays: true,
							},
						],
					},
					// For single day events
					{
						AND: [
							{
								startDate: {
									gte: startOfWeek.toISOString(),
									lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
								},
							},
							{
								multipleDays: false,
							},
						],
					},
				],
			};
			break;
		case "this_month":
			dateFilter = {
				OR: [
					// For multiple days events
					{
						AND: [
							{
								startDate: {
									lte: new Date(
										startOfMonth.getFullYear(),
										startOfMonth.getMonth() + 1,
										0,
									).toISOString(),
								},
							},
							{
								endDate: {
									gte: startOfMonth.toISOString(),
								},
							},
							{
								multipleDays: true,
							},
						],
					},
					// For single day events
					{
						AND: [
							{
								startDate: {
									gte: startOfMonth.toISOString(),
									lt: new Date(
										startOfMonth.getFullYear(),
										startOfMonth.getMonth() + 1,
										0,
									).toISOString(),
								},
							},
							{
								multipleDays: false,
							},
						],
					},
				],
			};
			break;
		default: // all_time
			dateFilter = {};
	}
	return dateFilter;
}

export function getDateFilter(timeFilter: string) {
	const now = new Date();
	const startOfToday = new Date(now.setHours(0, 0, 0, 0));
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	// Build date filter based on timeFilter
	let dateFilter = {};
	switch (timeFilter) {
		case "today":
			dateFilter = {
				createdAt: {
					gte: startOfToday,
					lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
				},
			};
			break;
		case "this_week":
			dateFilter = {
				createdAt: {
					gte: startOfWeek,
					lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
				},
			};
			break;
		case "this_month":
			dateFilter = {
				createdAt: {
					gte: startOfMonth,
					lt: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0),
				},
			};
			break;
		default: // all_time
			dateFilter = {};
	}
	return dateFilter;
}

export const calculateTotalTickets = (bookings: IBooking[]): number => {
	return bookings.reduce((sum, booking) => {
		try {
			// Parse tickets if they're stored as JSON string
			const tickets = typeof booking.tickets === "string" ? JSON.parse(booking.tickets) : booking.tickets || [];

			// Calculate tickets quantity
			const ticketsQuantity = Array.isArray(tickets)
				? tickets.reduce((ticketSum: number, ticket: any) => {
						return ticketSum + (Number(ticket?.quantity) || 0);
					}, 0)
				: 0;

			return sum + ticketsQuantity;
		} catch (error) {
			console.error("Error calculating tickets:", error);
			return sum;
		}
	}, 0);
};

export function isAdminEmailServer(email: string) {
	const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
	// console.log(envEmails, email);
	if (!envEmails) return false;

	const emailsArr = envEmails?.split(",").map((em) => em.trim());

	return emailsArr.includes(email);
}
