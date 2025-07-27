import { z } from "zod";

export enum FilterType {
	NEWEST = "newest",
	HIGHEST = "highest",
	LOWEST = "lowest",
}

const bookingDetailSchema = z.object({
	type: z.enum(["SINGLE", "GROUP", "PACKAGE"]),
	membersCount: z.number().optional(),
	title: z.string().optional(),
	amount: z.number(),
	currency: z.string().default("INR"),
	description: z.string().optional(),
});

const slotSchema = z.object({
	start: z.string(),
	end: z.string(),
});

const baseEventSchema = z.object({
	vendorId: z.number().optional(),
	eventSpecificType: z.string(),
	description: z.string().optional(),
	sportType: z.union([z.string(), z.array(z.string())]),
	status: z.enum(["pending", "approved", "rejected", "unpublished"]).optional().default("unpublished"),
	tags: z.array(z.string()),
	maximumParticipants: z.number().optional(),
	location: z.string(),
	images: z.array(z.string()).optional(),
	additionalInfo: z.string().optional(),
	bookingDetails: z.array(bookingDetailSchema).optional(),
});

export const createVenueSchema = baseEventSchema.extend({
	title: z.string(),
	eventCategory: z.string(),
	venueType: z.array(z.string()),
	eventType: z.array(z.string()),
	amenities: z.array(z.string()),
	weekDays: z.array(z.string()),
	slotsPerDay: z.number(),
	slotDuration: z.number(),
	openingTime: z.string(),
	closingTime: z.string(),
	slots: z.array(slotSchema),
});

export const createTrainerSchema = baseEventSchema.extend({
	name: z.string(),
	isOnline: z.boolean(),
	language: z.string(),
	certificate: z.string(),
	serviceType: z.array(z.string()),
	visibility: z.enum(["public", "private"]).optional().default("public"),
	weekDays: z.array(z.string()),
	slotsPerDay: z.number(),
	slotDuration: z.number(),
	startingTime: z.string(),
	endingTime: z.string(),
	slots: z.array(slotSchema),
});

export const createWorkshopSchema = baseEventSchema.extend({
	title: z.string(),
	host: z.string(),
	workshopType: z.array(z.string()),
	visibility: z.enum(["public", "private"]).optional().default("public"),
	isRecurring: z.boolean(),
	date: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	weekDays: z.array(z.string()).optional(),
	startingTime: z.string(),
	endingTime: z.string(),
	isOnline: z.boolean(),
});

export const filterBaseSchema = z.object({
	page: z.number().optional().default(1),
	limit: z.number().optional().default(10),
	title: z.string().optional(),
	category: z.string().optional(),
	vendorId: z.number().optional(),
	sportType: z.array(z.string()).optional(),
	status: z.string().optional(),
	visibility: z.string().optional(),
	location: z.string().optional(),
	startingTime: z.string().optional(),
	endingTime: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	isOnline: z.boolean().optional(),
	sortBy: z.enum(["startDate", "endDate", "title", "createdAt"]).optional(),
	sortOrder: z.enum(["ASC", "DESC"]).optional(),
});

export const UpdateEventSchema = z.object({
	description: z.string().optional(),
	title: z.string().optional(),
	host: z.string().optional(),
	status: z.string().optional(),
	visibility: z.string().optional(),
	isRecurring: z.boolean().optional(),
	date: z.string().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
	startingTime: z.string().optional(),
	endingTime: z.string().optional(),
	maximumParticipants: z.number().optional(),
	isOnline: z.boolean().optional(),
	location: z.string().optional(),
	additionalInfo: z.string().optional(),
	vendorId: z.number().optional(),
	workshopType: z.array(z.string()).optional(),
	sportType: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	images: z.array(z.string()).optional(),
	weekDays: z.array(z.string()).optional(),
	bookingDetails: z
		.array(
			z.object({
				type: z.string(),
				membersCount: z.number().nullable(),
				title: z.string().nullable(),
				amount: z.number(),
				currency: z.string().default("INR"),
				description: z.string().nullable(),
			}),
		)
		.optional(),
});

export const EventFilterSchema = z.object({
	title: z.string().optional(),
	category: z.string().optional(),
	vendorId: z.number().optional(),
	sportType: z.array(z.string()).optional(),
	status: z.string().optional(),
	visibility: z.string().optional(),
	location: z.string().optional(),
	isOnline: z.boolean().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	page: z.number().default(1),
	limit: z.number().default(10),
});

export const EventBuyerFilterSchema = z.object({
	name: z.string().optional(),
	eventId: z.number().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	page: z.number().default(1),
	limit: z.number().default(10),
});

export const PublishEventSchema = z.object({
	eventId: z.number(),
});

export const CreateCategorySchema = z.object({
	name: z.string(),
});

export const CreateSubCategorySchema = z.object({
	categoryId: z.string(),
	name: z.string(),
});

export const CreateTypeSchema = z.object({
	name: z.string(),
});

// Define the Zod schema for GetFeedbackDto (query parameters)
export const getFeedbackSchema = z.object({
	filter: z.nativeEnum(FilterType).optional().nullable(),
	page: z.number().int().min(1, { message: "page must be greater than or equal to 1" }),
	size: z.number().int().min(1, { message: "size must be greater than or equal to 1" }),
	eventId: z.number().int().optional(),
	vendorId: z.number().int().optional(),
	userId: z.number().int().optional(),
});

// Define the Zod schema for CreateFeedbackDto (request body)
export const createFeedbackSchema = z.object({
	userId: z.number().int().min(1, { message: "userId must be a positive integer" }),
	vendorId: z.number().int().min(1, { message: "vendorId must be a positive integer" }),
	comment: z.string().min(1, { message: "comment is required" }),
	rating: z.number().int().min(1).max(5, { message: "rating must be between 1 and 5" }),
	visible: z.boolean().optional(),
	eventId: z.number().int().optional(),
	trainersId: z.number().int().optional(),
	venuesId: z.number().int().optional(),
	workshopsId: z.number().int().optional(),
});
