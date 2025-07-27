"use client";

import { Search } from "lucide-react";

export function SearchInput() {
	return (
		<div className="relative">
			<input
				type="text"
				placeholder="Search"
				className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C3996B] focus:border-transparent"
			/>
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
		</div>
	);
}
