import BlogPage from "@/components/articles/BlogPage";
import { BlogService } from "@/services/articles.service";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

export const revalidate = 300;

export async function generateMetadata(
	{ params }: { params: Promise<{ slug: string }> },
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { slug } = await params;
	const prev = await parent;
	const data = await BlogService.getMetaData(slug);
	if (!data) {
		notFound();
	}

	return {
		title: data.title,
		description: data.brief ?? prev.description,
		openGraph: {
			...prev.openGraph,
			title: data.title,
			description: data.brief,
			url: `https://gethyra.com/blogs/${slug}`,
			images: data?.coverImage?.url,
		},
		keywords: data.tags.map((a) => a.name).join(",") + prev.keywords?.join(","),
		twitter: {
			title: data.title,
			description: data.brief,
			images: data?.coverImage?.url,
			card: "summary_large_image",
			site: "@gethyra",
			creator: "@gethyra",
		},
	};
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const { slug } = await params;
	const blog = await BlogService.getBlogBySlug(slug as string);
	return (
		<div className="flex max-lg:flex-col gap-5 ">
			<div className="flex flex-col max-w-5xl w-full mx-auto sm:px-3">
				<BlogPage blog={blog} />
			</div>
		</div>
	);
};

export default Page;
