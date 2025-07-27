import { z } from "zod";

export const bookingChartSchema = z.array(
	z.object({
		id: z.string().optional(),
		date: z.string(),
		slot: z
			.object({
				startTime: z.string(),
				endTime: z.string(),
			})
			.optional(),
		bookedSeats: z.number(),
	}),
);

export const bookingDetailSchema = z.array(
	z.object({
		id: z.string().optional(),
		type: z.enum(["SINGLE", "GROUP", "PACKAGE", "SUBSCRIPTION"]),
		membersCount: z.number(),
		title: z.string().optional(),
		amount: z.number(),
		months: z.number().optional(),
		currency: z.string().default("INR"),
		currencyIcon: z.string().default("₹"),
		description: z.string().optional(),
	}),
);

export const createEventSchema = z.object({
	vendorId: z.string().optional(),
	eventSpecificType: z.string(),
	sportType: z.string(),
	tags: z.string(),

	// General info
	title: z.string(),
	host: z.string().optional(),
	description: z.string(),

	isOnline: z.boolean(),
	isHomeService: z.boolean(),
	location: z.string(),
	landmark: z.string().optional(),
	city: z.string(),
	state: z.string(),
	country: z.string(),
	pincode: z.string().optional(),

	eventType: z.string(),
	amenities: z.array(z.string()).optional(),

	// Schedule info
	numberOfDays: z.number(),
	multipleDays: z.boolean(),
	isMonthlySubscription: z.boolean(),
	startDate: z.string(),
	endDate: z.string().optional(),
	weekDays: z.array(z.string()).optional(),

	startingTime: z.string(),
	endingTime: z.string(),

	isHaveSlots: z.boolean(),
	slotDuration: z.number().optional(),
	slots: z
		.array(
			z.object({
				start: z.string(),
				end: z.string(),
			}),
		)
		.optional(),

	isTeamEvent: z.boolean(),
	teamSize: z.number().optional(),
	maximumParticipants: z.number(),
	bookingChart: bookingChartSchema,

	// booking info
	bookingDetails: bookingDetailSchema,
	images: z.array(z.string()),
	termsAndConditions: z.string().optional(),

	// admin info
	language: z.string().optional().default("English"),
	visibility: z.string().optional().default("PUBLIC"),
});

export const updateEventSchema = z.object({
	eventId: z.string(),
	data: z.object({
		...createEventSchema.shape,
		status: z.string().optional().default("PENDING"),
	}),
});
