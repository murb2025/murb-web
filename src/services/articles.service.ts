import { GET_BLOG_BY_SLUG, GET_BLOGMETADATA, GET_BLOGS_BY_TAG, GET_BLOGS_QUERY, GET_SLUGS } from "@/constants/queries";
import { gql } from "@/lib/gql";
export const dynamic = "force-dynamic";

export class BlogService {
	static async getBlogs(page: number = 1) {
		try {
			const data = await gql(GET_BLOGS_QUERY, {
				host: process.env.NEXT_PUBLIC_HASHNODE_HOST,
				page: page,
			});
			if (data?.errors) {
			}
			return data.data.publication.postsViaPage;
		} catch (error) {}
	}

	static async getBlogsByTag(tag: string, page: number = 1) {
		try {
			const data = await gql(GET_BLOGS_BY_TAG, {
				host: process.env.NEXT_PUBLIC_HASHNODE_HOST,
				tag,
				page,
			});
			if (data?.errors) {
				return;
			}
			return data.data.publication.postsViaPage;
		} catch (error) {}
	}

	static async getBlogBySlug(slug: string) {
		try {
			const res = await gql(GET_BLOG_BY_SLUG, {
				host: process.env.NEXT_PUBLIC_HASHNODE_HOST,
				slug,
			});
			if (res?.errors) {
				return;
			}
			return res.data.publication.post;
		} catch (error) {}
	}

	static async getMetaData(slug: string) {
		try {
			const res = await gql(GET_BLOGMETADATA, {
				host: process.env.NEXT_PUBLIC_HASHNODE_HOST,
				slug,
			});
			if (res?.errors) {
				console.log(res?.errors);
				return;
			}
			return res.data.publication.post as {
				title: string;
				brief: string;
				tags: { name: string }[];
				coverImage: { url: string };
			};
		} catch (error) {}
	}
	static async getSlugs(page: number) {
		try {
			const data = await gql(GET_SLUGS, {
				host: process.env.NEXT_PUBLIC_HASHNODE_HOST,
				page: page,
			});
			if (data?.errors) {
				return;
			}
			return data.data.publication.postsViaPage;
		} catch (error) {}
	}
}
