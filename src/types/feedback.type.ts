export interface IReview {
	id: string;
	comment: string;
	rating: number;
	createdAt: string;
	user: {
		firstName: string;
		lastName: string;
		avatarUrl: string | null;
	};
}

export interface IFeedbackResponse {
	reviews: IReview[];
	total: number;
	page: number;
	size: number;
	totalPages: number;
}
