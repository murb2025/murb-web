export type T_USER_ROLE = "ADMIN" | "USER" | "GUEST" | "VENDOR" | "BUYER";

// export interface IUser {
// 	id: string;
// 	name: string;
// 	email: string;
// }

export interface IEventUserRegistration {
	id: string;
	userId: string;
	eventId: string;
	ticketTypeId: string;
	startTime?: Date;
	endTime?: Date;
	registrationDate?: Date;
	occurrenceDate: Date;
	paymentId?: number;
	ticketStatus: string;
}

export interface IPayment {
	id: string;
	userId?: string;
	eventId?: string;
	amount: number;
	method: string;
	currency: string;
	status: string;
	refundedAmount?: number;
	refundStatus?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IReview {
	id: string;
	eventId?: string;
	userId?: string;
	comment?: string;
	rating?: number;
	visible?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IUserWishlist {
	id: string;
	userId?: string;
	eventId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IUser {
	id: string;
	username: string | null;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	mobileNumber: string | null;
	aadharNumber: string | null;
	panNumber: string | null;
	bankAccountNumber: string | null;
	ifscCode: string | null;
	gstNumber: string | null;
	avatarUrl: string | null;
	role: string;
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

// export interface IUserResponse {
// 	id: string;
// 	name: string;
// 	email: string;
// 	role: T_USER_ROLE;
// }

export interface IOtpResponse {
	statusCode: number;
	message: string;
	data: {
		otp: string;
		expiresAt: string;
		newUser: boolean;
	};
}

export interface IOtpRequest {
	email: string;
	mobile: string;
	method: string;
	type: string;
}

export interface IOtpVerification {
	email: string;
	mobileNumber: string;
	otp: string;
	role: string;
}

export interface IUserResponse {
	statusCode: number;
	message: string;
	data: {
		userResponse: {
			id: string;
			email: string | null;
			mobileNumber: string;
			role: T_USER_ROLE;
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
			createdAt: string; // Date string format
			updatedAt: string; // Date string format
		};
		accessToken: string;
	};
}
