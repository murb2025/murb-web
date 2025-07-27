"use client";
import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/shadcn";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/provider";

export default function SearchBar() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	const searchQuery = trpc.event.search.useQuery(
		{ query: value },
		{
			enabled: value.length > 0,
			refetchOnWindowFocus: false,
		},
	);

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const handleSelect = (eventId: string) => {
		router.push(`/event/detail/${eventId}`);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (value === "") {
			return;
		}
		if (e.key === "Enter") {
			router.push(`/?event=search&query=${value}`);
			setOpen(false);
		}
	};

	return (
		<div className="relative w-full">
			<section className="relative flex items-center">
				<input
					className={cn(
						"flex h-10 md:h-14 w-full rounded-full border border-white bg-transparent pl-6 pr-10 md:pr-12",
						"text-white placeholder:font-semibold placeholder:text-white",
						"focus:outline-none focus:ring-none",
						"backdrop-blur-sm placeholder:text-sm md:placeholder:text-base placeholder:truncate",
					)}
					placeholder="Search Sports & Related Experiences..."
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
						setOpen(true);
					}}
					onClick={() => {
						if (value) {
							setOpen(true);
						}
					}}
					onKeyPress={handleKeyPress}
					onBlur={(e) => {
						// Check if the related target is within the search results
						if (!e.relatedTarget?.closest(".search-results")) {
							setTimeout(() => {
								setOpen(false);
							}, 200);
						}
					}}
				/>
				<div
					className="absolute right-4 cursor-pointer"
					onClick={() => {
						if (value) {
							setValue("");
							setOpen(false);
							router.push("/");
						}
					}}
				>
					{value ? (
						<X className="w-4 h-4 md:w-6 md:h-6 text-white" />
					) : (
						<Search className="w-4 h-4 md:w-6 md:h-6 text-white" />
					)}
				</div>
			</section>
			{open && (
				<div className="absolute z-30 mt-2 w-full rounded-lg border bg-white text-black px-4 py-3 shadow-lg">
					{searchQuery.data && searchQuery.data.events.length > 0 ? (
						searchQuery.data.events.map((event) => (
							<div
								key={event.id}
								onClick={() => handleSelect(event.id.toString())}
								className="search-results hover:scale-[1.01] duration-200 px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer"
							>
								<div className="flex flex-col">
									<span>{event.title}</span>
									<span className="text-xs text-muted-foreground">{event.eventSpecificType}</span>
								</div>
							</div>
						))
					) : value !== "" ? (
						<p className="text-muted-foreground">No results found.</p>
					) : (
						<p className="text-muted-foreground">Start typing to search.</p>
					)}
				</div>
			)}
		</div>
	);
}
