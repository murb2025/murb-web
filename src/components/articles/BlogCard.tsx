import { BlogListType } from "@/types/article.type";
import Link from "next/link";
import React from "react";
import Card from "./Card";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import image1 from "@/../public/home/crousal/image1.png";
import image2 from "@/../public/home/crousal/image2.png";
import image3 from "@/../public/home/crousal/image3.png";
import image4 from "@/../public/home/crousal/image4.png";

type Props = {
	blog: BlogListType;
};

const BlogCard = ({ blog }: Props) => {
	const getRandomImage = () => {
		const images = [image1, image2, image3, image4];
		return images[Math.floor(Math.random() * images.length)];
	};
	return (
		<Card className="flex flex-col overflow-hidden h-full">
			<Image
				src={blog?.coverImage?.url ?? getRandomImage()}
				width={1000}
				height={1000}
				quality={50}
				alt={blog.title}
				loading="eager"
				placeholder="blur"
				blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAGiAQMAAAAC0uYQAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAADUExURR8fH/BS2vwAAAA5SURBVHja7cEBDQAAAMKg909tDjegAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPg0isoAAaGR6YMAAAAASUVORK5CYII="
				className="roundedt-t-xl max-sm:hidden h-full object-contain hover:opacity-90 transition-opacity"
			/>
			<div className="p-4">
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<div className="flex items-center gap-1">
						<Calendar className="w-4 h-4" />
						<span>{format(blog.publishedAt, "MMM d, yyyy")}</span>
					</div>
					<span>•</span>
					<div className="flex items-center gap-1">
						<Clock className="w-4 h-4" />
						<span>{blog.readTimeInMinutes} min read</span>
					</div>
				</div>
				<h2 className="text-2xl font-semibold mt-3 mb-2">
					<Link href={`/articles/${blog.slug}`} className="hover:underline transition-colors">
						{blog.title}
					</Link>
				</h2>
				<p className="text-muted-foreground line-clamp-2 mb-4">{blog.brief}</p>
				<div className="flex gap-2 flex-wrap mb-auto">
					{blog?.tags?.map((tag) => (
						<span key={tag.id} className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
							#{tag.name}
						</span>
					))}
				</div>
				<Link
					href={`/articles/${blog.slug}`}
					className="flex items-center gap-2 text-sm font-medium transition-colors mt-4 hover:text-gray-500"
				>
					Read more
					<ArrowRight className="w-4 h-4" />
				</Link>
			</div>
		</Card>
	);
};

export default BlogCard;
