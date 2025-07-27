import { Button } from "@/components/ui/button";
import { categoriesData, sportsData } from "@/constants/event.constant";
import React from "react";

interface SportsListProps {
	selected: string;
	onSelect: (sport: string) => void;
	selectedSportCategory: string;
}

export const SportsList: React.FC<SportsListProps> = ({ selectedSportCategory, selected, onSelect }) => {
	return (
		<div className="grid grid-cols-2 md:flex flex-wrap mb-2 md:gap-3 gap-2 w-full">
			{(categoriesData[selectedSportCategory] || sportsData).slice(0, 25).map((sport, idx) => (
				<div
					key={idx}
					onClick={() => {
						if (selected === sport) {
							onSelect("");
							return;
						}
						onSelect(sport);
					}}
					className={`cursor-pointer text-center whitespace-normal md:px-4 py-2 font-normal md:min-w-[130px] text-base rounded-[8px] border transition-all ${
						selected === sport
							? "border-[#C3996B] bg-[#C3996B]  text-white"
							: "border-[#C3996B] text-[#8E7777] bg-transparent"
					}`}
				>
					{sport}
				</div>
			))}
		</div>
	);
};
