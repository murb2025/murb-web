"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import useQuery from "@/hooks/useQuery";
import { eventSpecificTypeData, sportsData } from "@/constants/event.constant";
import Link from "next/link";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { X } from "lucide-react";

const InterestSection = () => {
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const [filteredInterests, setFilteredInterests] = useState<string[]>(sportsData);
	const { getQuery, updateAndPushQuery } = useQuery();
	const [moreInterests, setMoreInterests] = useState<number>(1);
	const [searchTerm, setSearchTerm] = useState("");

	const interest = getQuery("interest");

	useEffect(() => {
		if (interest) {
			setSelectedInterests(interest.split("|"));
		}
	}, [interest]);

	const handleInterestClick = (interest: string) => {
		setSelectedInterests((prev) => {
			if (prev.includes(interest)) {
				return prev.filter((i) => i !== interest);
			} else {
				return [...prev, interest];
			}
		});
	};

	const handleRemoveInterest = (interestToRemove: string) => {
		setSelectedInterests((prev) => prev.filter((interest) => interest !== interestToRemove));
	};

	const submitInterest = () => {
		updateAndPushQuery({
			interest: selectedInterests.join("|"),
			event: "interest",
		});
	};

	const filterInterests = (term: string) => {
		setSearchTerm(term);
		const filtered = sportsData.filter((interest) => interest.toLowerCase().includes(term.toLowerCase()));
		setFilteredInterests(filtered);
	};

	// Get remaining interests excluding selected ones
	const remainingInterests = filteredInterests.filter((interest) => !selectedInterests.includes(interest));

	return (
		<>
			<div className="w-full relative overflow-hidden bg-[#FFFCF9] flex flex-col py-4 md:p-10 md:flex-row justify-center">
				<div className="flex flex-col items-center md:items-start gap-4 relative md:container">
					<h2 className="text-3xl font-medium text-center md:text-left">Hey! What are you looking for?</h2>
					<div className="w-full py-1 grid grid-cols-2 sm:grid-cols-4  md:grid-cols-6 gap-4 mb-6">
						{eventSpecificTypeData.map((type, idx) => (
							<Link
								href={`/?type=${type.value}&event=eventTypeFull`}
								key={idx}
								className="flex gap-5 flex-col h-full items-center justify-start cursor-pointer hover:scale-105 transition-all ease-in-out-400"
							>
								<div
									className={`w-16 h-16 bg-white rounded-full flex items-center shadow-xl justify-center`}
								>
									<Image
										src={type.imgSrc}
										alt={`${type.name}_icon`}
										width={80}
										height={80}
										className="h-10 w-10"
									/>
								</div>
								<p className="font-regular text-base text-center max-w-[100px] leading-[]">
									{type.value}
								</p>
							</Link>
						))}
					</div>

					<h2 className="text-3xl font-medium text-center md:text-left mt-4">Tell us what you love</h2>
					<p className="text-xl md:text-2xl px-2 md:px-0 font-normal text-center md:text-left text-[#7D7272]">
						This will help us curate events specially for you
					</p>

					<div className="w-full max-w-md mx-auto mb-4">
						<input
							type="text"
							placeholder="Search interests..."
							value={searchTerm}
							className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
							onChange={(e) => filterInterests(e.target.value)}
						/>
					</div>

					<div className="flex flex-wrap justify-center gap-2 w-full">
						{/* Selected interests shown first */}
						{selectedInterests.map((interest, idx) => (
							<div key={idx} className="relative group">
								<Button
									className={`px-3 min-w-[85px] lg:min-w-[120px] py-2 text-sm sm:text-base rounded-full border
									bg-[#C4A484] text-white border-[#C4A484]`}
								>
									{interest}
								</Button>
								<button
									onClick={() => handleRemoveInterest(interest)}
									className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<X size={12} />
								</button>
							</div>
						))}

						{/* Remaining interests */}
						{remainingInterests.slice(0, moreInterests * 17).map((interest, idx) => (
							<Button
								key={idx}
								onClick={() => handleInterestClick(interest)}
								className={`px-3 min-w-[85px] lg:min-w-[120px] py-2 text-sm sm:text-base rounded-full border border-gray-300 
								hover:bg-[#C4A484] hover:text-white hover:border-[#C4A484] 
								transition-colors duration-200 bg-white text-[#7D7272]`}
							>
								{interest}
							</Button>
						))}
						<Button
							key={"all"}
							onClick={() => {
								if (moreInterests === Math.ceil(sportsData.length / 17)) {
									setMoreInterests(1);
								} else {
									setMoreInterests(moreInterests + 1);
								}
							}}
							className={`px-3 min-w-[85px] lg:min-w-[120px] py-2 text-sm sm:text-base rounded-full border border-gray-300 
								hover:bg-[#C4A484] hover:text-white hover:border-[#C4A484] 
								transition-colors duration-200
								bg-[#C2996A33] text-[#7D7272]`}
						>
							{moreInterests === Math.ceil(sportsData.length / 17) ? "Show Less" : "Show More"}
						</Button>
					</div>

					<HoverCard>
						<HoverCardTrigger>
							<Button
								className="bg-black text-white w-fit text-base px-6 py-2 rounded-[8px] hover:bg-gray-800 transition-colors duration-200"
								onClick={submitInterest}
								disabled={selectedInterests.length === 0}
							>
								Get Started
							</Button>
						</HoverCardTrigger>
						<HoverCardContent className="bg-white text-black">
							<p className="text-sm text-gray-500">Please select at least one interest to get started.</p>
						</HoverCardContent>
					</HoverCard>
				</div>
				<Image
					src={"/home/what-you-love.png"}
					width={500}
					height={500}
					alt="interest section"
					className="w-full md:w-1/2 object-contain self-start hidden lg:block"
				/>
			</div>
		</>
	);
};

export default InterestSection;
