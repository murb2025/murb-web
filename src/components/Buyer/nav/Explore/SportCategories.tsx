import React from "react";
import Image from "next/image";

interface SportCategoryProps {
	selected: string;
	onSelect: (category: string) => void;
}

export const SportCategories: React.FC<SportCategoryProps> = ({ selected, onSelect }) => {
	const categories = [
		{
			id: "popular",
			icon: "/images/Popular.svg",
			label: "Popular Sports",
		},
		{
			id: "wellness",
			icon: "/images/Wellness.svg",
			label: "Wellness",
		},
		{
			id: "combat",
			icon: "/images/Combat.svg",
			label: "Combat & Martial Arts",
		},
		{
			id: "adventure",
			icon: "/images/Adventure.svg",
			label: "Adventure Sports",
		},
		{ id: "gaming", icon: "/images/Gaming.svg", label: "Gaming & Esports" },
		{
			id: "fitness",
			icon: "/images/Fitness.svg",
			label: "Fitness & Endurance",
		},
	];

	const getSelectedCategoryImage = (category: string) => {
		switch (category) {
			case "Popular Sports":
				return (
					<Image
						src="/icons/popular.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Adventure Sports":
				return (
					<Image
						src="/icons/adventure.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Gaming & Esports":
				return (
					<Image
						src="/icons/gaming.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Fitness & Endurance":
				return (
					<Image
						src="/icons/fitness.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Combat & Martial Arts":
				return (
					<Image
						src="/icons/martial.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			default:
				return (
					<Image
						src="/icons/wellness.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
		}
	};

	const getCategoryImage = (category: string) => {
		switch (category) {
			case "Popular Sports":
				return (
					<Image
						src="/icons/Popular-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Adventure Sports":
				return (
					<Image
						src="/icons/Adventure-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Gaming & Esports":
				return (
					<Image
						src="/icons/Gaming-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Fitness & Endurance":
				return (
					<Image
						src="/icons/Fitness-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			case "Combat & Martial Arts":
				return (
					<Image
						src="/icons/Combat-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
			default:
				return (
					<Image
						src="/icons/Wellness-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8"
					/>
				);
		}
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-6 gap-0 mb-4 w-full">
			{categories?.map(({ id, label }, idx) => (
				<div
					className="flex gap-5 flex-col h-full items-center justify-start cursor-pointer hover:scale-105 transition-all ease-in-out-400"
					key={idx}
					onClick={() => {
						if (selected === label) {
							onSelect("");
							return;
						}
						onSelect(label);
					}}
				>
					<div
						className={`w-16 h-16 bg-white rounded-full flex items-center shadow-xl justify-center ${
							label === selected && "!bg-[#A27C52]"
						}`}
					>
						{label === selected ? getSelectedCategoryImage(label) : getCategoryImage(label)}
					</div>
					<p className="font-regular text-base text-center max-w-[100px] leading-[]">{label}</p>
				</div>
			))}
		</div>
	);
};
