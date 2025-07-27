import { users } from "@prisma/client";

export interface IReview {
	id: string;
	userId: string | null;
	comment: string | null;
	rating: number;
	visible: boolean;
	createdAt: Date;
	updatedAt: Date;
	eventId: string | null;
	users?: users | null;
}

export interface ICreateReview {
	eventId: string;
	rating: number;
	comment?: string;
}
