export type BlogListType = {
	id: string;
	slug: string;
	title: string;
	tags: Tag[];
	brief: string;
	coverImage: {
		url: string;
	};
	readTimeInMinutes: number;
	publishedAt: Date;
};

export type Tag = {
	id: string;
	name: string;
	slug: string;
};

export type BlogType = {
	id: string;
	slug: string;
	title: string;
	tags: Tag[];
	author: User;
	brief: string;
	coverImage: {
		url: string;
	};
	readTimeInMinutes: number;
	hasLatexInPost: boolean;
	publishedAt: Date;
	content: {
		html: string;
	};
};

export type User = {
	name: string;
	profilePicture: string;
};
