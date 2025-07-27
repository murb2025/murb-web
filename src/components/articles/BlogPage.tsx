"use client";
import { BlogType } from "@/types/article.type";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { enhanceHtmlContent } from "@/utils/helper";
import { format } from "date-fns";
import CustomPhotoView from "./CustomPhotoView";

type Props = {
	blog: BlogType;
};

const BlogPage = ({ blog }: Props) => {
	const [htmlContent, setHtmlContent] = useState(blog.content.html);
	useEffect(() => {
		if (typeof window == "undefined") return;
		setHtmlContent(enhanceHtmlContent(blog.content.html));
	}, [blog.content.html]);
	useGSAP(() => {
		gsap.from(".animate", {
			opacity: 0,
			y: 30,
			duration: 0.6,
		});
	});

	useEffect(() => {
		document.querySelectorAll(".copy-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				if (navigator.clipboard) {
					navigator.clipboard.writeText(btn.parentElement?.nextElementSibling?.firstChild?.textContent ?? "");
					btn.textContent = "Copied!";
					setTimeout(() => {
						btn.textContent = "Copy";
					}, 1000);
				}
			});
		});
		return () => {
			document.querySelectorAll(".copy-btn").forEach((btn) => {
				btn.removeEventListener("click", () => {});
			});
		};
	}, [blog, htmlContent]);

	return (
		<article itemScope itemType="http://schema.org/BlogPosting">
			{blog?.coverImage?.url && (
				<Image
					src={blog.coverImage.url}
					width={1000}
					height={1000}
					quality={100}
					priority={true}
					alt={blog.title}
					loading="eager"
					placeholder="blur"
					blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAGiAQMAAAAC0uYQAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAADUExURR8fH/BS2vwAAAA5SURBVHja7cEBDQAAAMKg909tDjegAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPg0isoAAaGR6YMAAAAASUVORK5CYII="
					className="rounded-xl w-full animate hover:opacity-90 transition-opacity my-3 mx-auto"
				/>
			)}
			<h1 className="animate sm:text-3xl text-2xl font-semibold tracking-tight !leading-tight text-center mt-6">
				{blog.title}
			</h1>
			<div className="flex justify-center gap-2 animate mt-1 text-foreground/80 text-center">
				<span className="text-center">{format(blog.publishedAt, "MMM d, yyyy")}</span>•
				<span className="text-center">{blog.readTimeInMinutes} min read</span>
			</div>

			<div className="bg-foreground/30 animate my-8 h-[1px]" />
			<CustomPhotoView htmlContent={htmlContent} />
			<div className="py-6 flex gap-2 flex-wrap ">
				{blog?.tags?.map((tag, index) => (
					<p
						className="px-2 py-1 rounded-2xl bg-secondaryBackground border border-foreground/20 font-medium sm:text-sm text-xs"
						key={tag.id}
					>
						#{tag.name}
					</p>
				))}
			</div>
		</article>
	);
};

export default BlogPage;
