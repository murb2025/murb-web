import Blogs from "@/components/articles/Blogs";

export default async function Home() {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-semibold mt-8 text-center">Articles</h1>
			<Blogs />
		</div>
	);
}
