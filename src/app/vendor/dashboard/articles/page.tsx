import Blogs from "@/components/articles/Blogs";
import React from "react";

export default function page() {
	return (
		<main className="flex-1 overflow-auto">
			<div>
				<h2 className="text-black text-2xl font-medium">Articles</h2>
			</div>
			<Blogs />
		</main>
	);
}
