import { PaymentStatus } from "@prisma/client";
import { IUser } from "./user.type";

export interface IEvent {
	id: string | undefined;
	vendorId: string;
	eventSpecificType: string;
	sportType: string;
	tags: string;

	// General info
	title: string;
	host?: string;
	description: string;

	eventType: string;
	amenities?: string[];

	isOnline: boolean;
	location: string;
	landmark?: string;
	city: string;
	state: string;
	country: string;
	pincode: string;

	// Schedule info
	isMonthlySubscription: boolean;
	multipleDays: boolean;
	startDate: string;
	endDate?: string;
	weekDays?: string[];
	numberOfDays: number; // how many days the ticket is valid for

	startingTime: string;
	endingTime: string;

	isHomeService: boolean;
	isHaveSlots: boolean;
	slotDuration?: number;
	slots?: {
		start: string;
		end: string;
	}[];

	isTeamEvent: boolean;
	teamSize: number;
	maximumParticipants: number;
	minimumParticipants: number | undefined;

	bookingChart: IBookingChart[];

	_count?: {
		bookingChart: number;
	};

	// booking info
	bookingDetails: IBookingDetail[];
	images: string[];
	termsAndConditions: string;
	seoTags: string[];

	// admin info
	status?: string;
	visibility?: string;
	language: string;

	// extra

	bookmark?: {
		createdAt: Date;
		eventId: string;
		id: string;
		userId: string;
	}[];

	bookedSlot?: {
		id: string | undefined;
		date: string;
		bookedSeats: number;
		slot: {
			startTime: string;
			endTime: string;
		};
	};

	reviews?: IReview[];

	featured?: {
		createdAt: Date;
		eventId: string;
		id: string;
		updatedAt: Date;
	};

	trending?: {
		createdAt: Date;
		eventId: string;
		id: string;
		updatedAt: Date;
	};

	promotionPayment?: {
		updatedAt: Date;
		createdAt: Date;
		id: string;
		userId: string;
		eventId: string;
		status: string;
	}[];

	addonPayment?: {
		id: string;
		userId: string;
		eventId: string;
		totalAmount: number;
		paymentId: string;
		orderId: string;
		status: PaymentStatus;
		createdAt: Date;
		updatedAt: Date;
	}[];

	users?: IUser;
}

export interface IOrderRequest {
	userId: string;
	eventId: string;
	members: Array<{
		name: string;
		phone: string;
		email: string;
	}>;
	tickets: Array<{
		ticketId: string;
		quantity: number;
	}>;
	bookingChartId: string;
}

export interface IBookingDetail {
	id: string | undefined;
	type: "SINGLE" | "GROUP" | "PACKAGE" | "SUBSCRIPTION";
	membersCount: number;
	title?: string;
	amount: number;
	currency: string;
	months?: number;
	currencyIcon: string;
	description?: string;
}
export interface IReview {
	id?: string;
	rating: number;
	comment: string;
	updatedAt: Date;
	users?: {
		id?: string;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
	};
	comments?: Array<{
		content: string;
		createdAt: Date;
		updatedAt: Date;
		userId: string;
		user?: {
			id?: string;
			firstName?: string;
			lastName?: string;
			avatarUrl?: string;
			role?: string;
		};
	}>;
}

export interface IBookingChart {
	id: string | undefined;
	date: string;
	slot?: {
		startTime: string;
		endTime: string;
	};
	bookedSeats: number;
	isBookingEnabled: boolean;
}
export interface IEventStats {
	totalEvents: number;
	liveEvents: number;
	pendingEvents: number;
	ticketSold: number;
}

export interface ICrousalEvent {
	id?: string;
	title: string;
	time: string;
	date: string;
	ticketLeft: string;
	images: string[];
	isOnline: boolean;
	location: string;
	tags: string;
}

export interface IEventCategory {
	id: string;
	category: string;
	createdAt: string;
	updatedAt: string;
	eventSubCategories: {
		id: string;
		categoryId: string;
		subcategory: string;
		createdAt: string;
		updatedAt: string;
	}[];
}

export interface IEventType {
	id: string;
	type: string;
	created_at: string;
	updated_at: string;
}

export interface IEventSubCategory {
	id: string;
	categoryId: string;
	subcategory: string;
	createdAt: string;
	updatedAt: string;
}

export interface IUserProfile {
	id: string;
	email: string | null;
	mobileNumber: string;
	role: string;
	username: string | null;
	firstName: string | null;
	lastName: string | null;
	avatarUrl: string | null;
	businessName: string | null;
	businessType: string | null;
	businessAddress: string | null;
	businessRegistrationNumber: string | null;
	taxIdentificationNumber: string | null;
	valueAddedTaxNumber: string | null;
	businessLogoUrl: string | null;
	govermentPhotoIdUrls: string[];
	accountStatus: string;
	createdAt: string;
	updatedAt: string;
}
export interface IRecurrencePattern {
	frequency: "weekly" | "monthly";
	interval: number;
	weekDays?: string[];
	monthDay?: number;
	endDate: string;
}

export interface ITimeSlot {
	start: Date;
	end: Date;
	status?: string;
}

export interface FileWithPreview extends File {
	preview: string;
}

export interface IGeneralInfo {
	selectedCategory?: IEventCategory;
	selectedSubCategory?: IEventSubCategory;
	selectedType?: IEventType;
	eventDate?: Date;
	eventTime?: ITimeSlot[];
	repeatEvent?: IRecurrencePattern;
	eventImages?: File[];
	title: string;
	description: string;
}

export interface IPricing {
	ticketName: string;
	price: number;
	currency: string;
	qty: number;
}
