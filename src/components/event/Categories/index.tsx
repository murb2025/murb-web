"use client";
import { IEvent, IEventCategory, IEventType } from "@/types/event.type";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoriesData, eventSpecificTypeEnum, eventTypes } from "@/constants/event.constant";
import { cn } from "@/lib/utils";
import OtherTagButton from "./OtherTagButton";

interface Icategories {
	handleCategories: (_: string) => void;
	setPageType: (_: "CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH") => void;
	event: IEvent;
	updateEvent: (event: Partial<IEvent>) => void;
	pageType: "CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH";
}

const Categories = ({ handleCategories, event, updateEvent, pageType, setPageType }: Icategories) => {
	const [category, setCategory] = useState<string>("");
	const [sportType, setSportType] = useState<string>("");
	const [showTags, setShowtags] = useState(false);
	const [tags, setTags] = useState<string>(event.tags || "");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const handleCategorySelecton = (category: string) => {
		if (!event.sportType) {
			updateEvent({
				...event,
				eventSpecificType: category,
			});
			setShowtags(false);
			setSportType("");
			setTags("");
		}
		updateEvent({
			...event,
			eventSpecificType: category,
		});
	};

	const getCategoryImage = (category: string) => {
		switch (category) {
			case "Popular Sports":
				return (
					<Image
						src="/icons/popular.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Adventure Sports":
				return (
					<Image
						src="/icons/adventure.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Gaming & Esports":
				return (
					<Image
						src="/icons/gaming.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Fitness & Endurance":
				return (
					<Image
						src="/icons/fitness.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Combat & Martial Arts":
				return (
					<Image
						src="/icons/martial.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			default:
				return (
					<Image
						src="/icons/wellness.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
		}
	};

	const getSelectedCategoryImage = (category: string) => {
		switch (category) {
			case "Popular Sports":
				return (
					<Image
						src="/icons/Popular-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Adventure Sports":
				return (
					<Image
						src="/icons/Adventure-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Gaming & Esports":
				return (
					<Image
						src="/icons/Gaming-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Fitness & Endurance":
				return (
					<Image
						src="/icons/Fitness-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			case "Combat & Martial Arts":
				return (
					<Image
						src="/icons/Combat-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
			default:
				return (
					<Image
						src="/icons/Wellness-1.svg"
						alt={`${category}_icon`}
						width={58}
						height={58}
						className="w-8 h-8 sm:w-10 sm:h-10"
					/>
				);
		}
	};

	const getMajorCategoryImage = (category: string) => {
		switch (category) {
			case eventSpecificTypeEnum.VENUE:
				return (
					<Image
						src="/icons/Venues.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.WORKSHOPS:
				return (
					<Image
						src="/icons/Certificates.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.EVENTS_EXPERIENCES:
				return (
					<Image
						src="/icons/Events.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.TRAINER:
				return (
					<Image
						src="/icons/Trainers.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.CLASSES_SESSIONS:
				return (
					<Image
						src="/icons/Class.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			default:
				return (
					<Image
						src="/icons/Tournament.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
		}
	};

	const getSelectedMajorCategoryImage = (category: string) => {
		switch (category) {
			case eventSpecificTypeEnum.VENUE:
				return (
					<Image
						src="/icons/Venue-1.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.WORKSHOPS:
				return (
					<Image
						src="/icons/Certificate-1.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.EVENTS_EXPERIENCES:
				return (
					<Image
						src="/icons/Event-1.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.TRAINER:
				return (
					<Image
						src="/icons/Trainer-1.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			case eventSpecificTypeEnum.CLASSES_SESSIONS:
				return (
					<Image
						src="/icons/Classses-1.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
			default:
				return (
					<Image
						src="/icons/Trophy.svg"
						alt={`${category}_icon`}
						width={80}
						height={80}
						className="h-8 w-8 sm:h-10 sm:w-10"
					/>
				);
		}
	};

	useEffect(() => {
		updateEvent({
			...event,
			tags: tags,
		});
		// eslint-disable-next-line
	}, [tags]);

	useEffect(() => {
		const preRenderStoredValues = () => {
			setCategory(event.eventSpecificType);
			handleCategories(event.eventSpecificType);
			if (event.sportType) {
				setSportType(event.sportType);
				setShowtags(true);
				setTags(event.tags || "");
			}
		};

		preRenderStoredValues();
		// eslint-disable-next-line
	}, []);

	return (
		<>
			{pageType === "CATEGORIES" ? (
				<div className="flex flex-col items-center w-full px-4 sm:px-0">
					<div className="flex flex-col items-center gap-1 my-8 sm:my-12">
						<h1 className="font-semibold text-center font-gilroy text-2xl sm:text-3xl text-[#1F1F1F]">
							Categories
						</h1>
						<p className="font-normal font-gilroy text-center text-base sm:text-lg mt-4 text-[#1F1F1F]">
							What do you want to list?
						</p>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:max-w-[70%] gap-2 sm:gap-4 items-start">
						{eventTypes?.map((item, index) => {
							if (item === "Seminar") return;
							return (
								<div
									className={cn(
										"flex gap-3 sm:gap-5 flex-col h-full items-center justify-start cursor-pointer hover:text-[#C3996B] hover:scale-110 transition-all ease-400 group",
										category === item ? "text-[#C3996B] scale-110" : "text-[#1F1F1F]",
									)}
									key={`categories_${index}`}
									onClick={() => {
										setCategory(item);
										handleCategorySelecton(item);
										handleCategories(item);
										setPageType("SPORTS");
										if (item === eventSpecificTypeEnum.TOURNAMENTS_COMPETITIONS) {
											updateEvent({
												...event,
												multipleDays: false,
											});
										}
									}}
								>
									<div
										className={cn(
											"w-16 h-16 sm:w-20 sm:h-20 shadow-lg rounded-full flex items-center justify-center",
										)}
									>
										<div className="relative">
											<div
												className={cn(
													category === item
														? "hidden group-hover:block"
														: "block group-hover:hidden",
												)}
											>
												{getMajorCategoryImage(item)}
											</div>
											<div
												className={cn(
													category === item
														? "block group-hover:hidden"
														: "hidden group-hover:block",
												)}
											>
												{getSelectedMajorCategoryImage(item)}
											</div>
										</div>
									</div>
									<p className="font-normal break-words font-gilroy group-hover:text-[#C3996B] text-base sm:text-lg w-fit text-center">
										{item}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			) : pageType === "SPORTS" ? (
				<div className="px-4 sm:px-8 flex flex-col items-center">
					<h1 className="font-semibold text-center font-gilroy text-2xl sm:text-3xl text-[#1F1F1F]">
						Type of Sport
					</h1>
					<p className="font-normal font-gilroy text-center text-base sm:text-lg mt-3 sm:mt-5 text-[#1F1F1F]">
						What do you want to list?
					</p>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:max-w-[70%] sm:gap-4 items-start lg:gap-12 mt-8">
						{Object.keys(categoriesData)?.map((item, index) => {
							if (item === "Seminar") return;
							return (
								<div
									className="flex gap-3 sm:gap-5 flex-col h-full items-center justify-start cursor-pointer hover:scale-110 transition-all ease-400"
									key={`categories_${index}`}
									onClick={() => {
										setSportType(item);
										setTags("");
										updateEvent({
											...event,
											sportType: item,
											tags: "",
										});

										setShowtags(true);
									}}
								>
									<div
										className={`w-16 h-16 sm:w-20 sm:h-20 bg-[#C3996B] rounded-full flex items-center shadow-xl justify-center ${
											item === sportType ? "" : "text-[#8E7777] bg-white"
										}`}
									>
										{item === sportType ? getCategoryImage(item) : getSelectedCategoryImage(item)}
									</div>
									<p className="font-regular text-sm sm:text-lg text-center">{item}</p>
								</div>
							);
						})}
					</div>
					{showTags && (
						<div className="flex flex-col my-8 items-center w-full justify-center">
							<h1 className="font-semibold text-xl sm:text-2xl text-[#1F1F1F] text-left">Sport</h1>
							<div className="w-full px-2 sm:px-8 lg:px-32 mt-4">
								<Input
									type="text"
									placeholder="Search Sports..."
									className="max-w-md mx-auto mb-4 rounded-full h-12"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<div className="font-normal text-[#8E7777] text-base sm:text-lg flex justify-center items-center flex-wrap gap-2 sm:gap-3 min-h-[44px]">
									{categoriesData[sportType]
										.filter((subCategory) =>
											subCategory.toLowerCase().includes(searchQuery.toLowerCase()),
										)
										.map((subCategory, subIndex) => {
											const isSelected = tags === subCategory;
											return (
												<div
													key={`tags_${subIndex}`}
													className={`min-w-[120px] sm:min-w-[148px] h-[40px] sm:h-[44px] text-nowrap px-2 shadow-md rounded-md border border-[#C3996B] items-center justify-center flex cursor-pointer hover:scale-105 transition-all ease duration-300 ${
														isSelected ? "bg-[#C3996B] text-white" : ""
													}`}
													onClick={() => {
														if (isSelected) {
															setTags("");
														} else {
															setTags(subCategory);
														}
													}}
												>
													{subCategory}
												</div>
											);
										})}
									<OtherTagButton tags={tags} setTags={setTags} />
								</div>
							</div>
						</div>
					)}
					{tags && (
						<Button
							className="bg-[#383838] hover:scale-95 transition-all ease duration-300 hover:bg-black/90 text-white w-[100px] text-base sm:text-lg my-4"
							onClick={() => {
								setPageType("LISTING");
							}}
							disabled={tags === ""}
						>
							Next
						</Button>
					)}
				</div>
			) : null}
		</>
	);
};

export default Categories;
