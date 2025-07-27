import React from "react";
import Image from "next/image";
import { eventSpecificTypeData } from "@/constants/event.constant";

interface SidebarCategoryProps {
	selected: string;
	onSelect: (category: string) => void;
}

export const SidebarCategory: React.FC<SidebarCategoryProps> = ({ selected, onSelect }) => {
	return (
		<div className="w-fit md:border-r border-[#EDE0D1] py-1 grid grid-cols-2 md:grid-cols-1 md:flex-nowrap gap-5">
			{eventSpecificTypeData.map((type, idx) => (
				<div
					key={idx}
					onClick={() => onSelect(type.value)}
					className={`w-full px-2 cursor-pointer bg-transparent flex flex-col justify-center items-center gap-2 transition-colors ${
						selected === type.value ? "text-[#A27C52]" : "text-black hover:text-[#A27C52]"
					}`}
				>
					<Image
						src={selected === type.value ? type.imgSrc : type.imgColorSrc}
						alt={`${type.name}_icon`}
						width={80}
						height={80}
						className="h-10 w-10"
					/>

					<span className="text-base break-words font-medium text-center">{type.name}</span>
				</div>
			))}
		</div>
	);
};
