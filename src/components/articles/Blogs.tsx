"use client";
import BlogCard from "@/components/articles/BlogCard";
import { BlogService } from "@/services/articles.service";
import { Loader2 } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BlogType } from "@/types/article.type";
import toast from "react-hot-toast";

export default function Blogs() {
	const [blogs, setBlogs] = useState<BlogType[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);

	useGSAP(() => {
		gsap.from(".animate", {
			opacity: 0,
			y: 30,
			duration: 0.5,
			stagger: 0.1,
		});
	});

	const fetchData = async () => {
		try {
			const data = await BlogService.getBlogs(1);
			setBlogs(data.nodes);
			if (data.pageInfo.nextPage != null) {
				setPage(data.pageInfo.nextPage);
			}
			setHasMore(data.pageInfo.hasNextPage ?? false);
		} catch (e) {
			toast.error("Error fetching blogs");
			setBlogs([]);
		} finally {
			setLoading(false);
		}
	};

	const addNextBlogs = async () => {
		if (!hasMore) return;
		try {
			const data = await BlogService.getBlogs(page);
			if (data) {
				setBlogs((prev) => [...prev, ...data.nodes]);
				if (data.pageInfo.nextPage != null) {
					setPage(data.pageInfo.nextPage);
				}
				setHasMore(data.pageInfo.hasNextPage ?? false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div className="flex flex-1 gap-5">
			<div className="mx-auto overflow-hidden sm:p-5 max-sm:my-5">
				<InfiniteScroll
					className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
					dataLength={blogs.length}
					next={addNextBlogs}
					hasMore={hasMore}
					loader={
						<div className="col-span-full flex gap-3 my-5 items-center justify-center">
							<Loader2 className="animate-spin" />
							Loading...
						</div>
					}
					endMessage={
						<div className="col-span-full text-center text-muted-foreground py-8">
							{blogs.length > 0 ? (
								<p>You've reached the end of our articles. Thank you for reading!</p>
							) : (
								<p>No articles to show</p>
							)}
						</div>
					}
				>
					{blogs.map((blog, index) => (
						<BlogCard blog={blog} key={index} />
					))}
				</InfiniteScroll>
			</div>
		</div>
	);
}
