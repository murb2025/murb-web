import { categoriesData } from "@/constants/event.constant";
import { eventTypes } from "@/constants/event.constant";
import { cn } from "@/lib/utils";
import { IEvent } from "@/types/event.type";
import React from "react";

export default function EditCategories({ event, setEvent }: { event: IEvent; setEvent: (event: IEvent) => void }) {
	return (
		<div>
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
									event.eventSpecificType.includes(item) ? "text-[#C3996B]" : "text-[#1F1F1F]",
								)}
								key={`categories_${index}`}
								onClick={() => {
									setEvent({
										...event,
										eventSpecificType: item,
									});
								}}
							>
								<div className="w-16 h-16 sm:w-20 sm:h-20 shadow-lg rounded-full flex items-center justify-center">
									{/* <div className="group-hover:hidden">{getMajorCategoryImage(item)}</div>
									<div className="hidden group-hover:block">
										{getSelectedMajorCategoryImage(item)}
									</div> */}
								</div>
								<p className="font-normal break-words font-gilroy group-hover:text-[#C3996B] text-base sm:text-lg w-fit text-center">
									{item}
								</p>
							</div>
						);
					})}
				</div>
			</div>

			<div className="px-4 sm:px-8 flex flex-col items-center">
				<h1 className="font-semibold text-center font-gilroy text-2xl sm:text-3xl text-[#1F1F1F]">
					Type of Sport
				</h1>
				<p className="font-normal font-gilroy text-center text-base sm:text-lg mt-3 sm:mt-5 text-[#1F1F1F]">
					What do you want to list?
				</p>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:flex flex-wrap gap-4 justify-center sm:gap-8 lg:gap-12 mt-8 sm:mt-12">
					{Object.keys(categoriesData)?.map((item, index) => {
						if (item === "Seminar") return;
						return (
							<div
								className="flex gap-3 sm:gap-5 flex-col h-full items-center justify-center cursor-pointer hover:scale-110 transition-all ease-400"
								key={`categories_${index}`}
								onClick={() => {
									setEvent({
										...event,
										sportType: item,
									});
								}}
							>
								<div
									className={`w-16 h-16 sm:w-20 sm:h-20 bg-[#C3996B] rounded-full flex items-center shadow-xl justify-center ${
										item === event.sportType ? "" : "text-[#8E7777] bg-white"
									}`}
								>
									{/* {item === event.sportType ? getCategoryImage(item) : getSelectedCategoryImage(item)} */}
								</div>
								<p className="font-regular text-sm sm:text-lg text-center">{item}</p>
							</div>
						);
					})}
				</div>

				<div className="flex flex-col my-8 sm:mt-20 md:mt-20 items-center w-full justify-center">
					<h1 className="font-normal text-xl sm:text-2xl text-[#1F1F1F] text-left">Sport</h1>
					<div className="flex flex-wrap justify-center gap-2 mt-4 w-full px-2 sm:px-8">
						{/* <div className="flex gap-3 sm:gap-5 w-full mb-2"> */}
						<div className="font-normal text-[#8E7777] text-base sm:text-lg flex justify-center items-center flex-wrap gap-2 sm:gap-3 min-h-[44px]">
							{categoriesData[event.sportType].map((subCategory, subIndex) => {
								const isSelected = event.tags === subCategory;
								return (
									<div
										key={`tags_${subIndex}`}
										className={`min-w-[120px] sm:min-w-[148px] h-[40px] sm:h-[44px] text-nowrap px-2 shadow-md rounded-md border border-[#C3996B] items-center justify-center flex cursor-pointer hover:scale-105 transition-all ease duration-300 ${
											isSelected ? "bg-[#C3996B] text-white" : ""
										}`}
										onClick={() => {
											if (isSelected) {
												setEvent({
													...event,
													tags: "",
												});
											} else {
												setEvent({
													...event,
													tags: subCategory,
												});
											}
										}}
									>
										{subCategory}
									</div>
								);
							})}
							<div
								className={`min-w-[120px] sm:min-w-[148px] h-[40px] sm:h-[44px] text-nowrap px-2 shadow-md rounded-md border border-[#C3996B] items-center justify-center flex cursor-pointer hover:scale-105 transition-all ease duration-300 ${
									event.tags === "Other" ? "bg-[#C3996B] text-white" : ""
								}`}
								onClick={() => {
									if (event.tags === "Other") {
										setEvent({
											...event,
											tags: "",
										});
									} else {
										setEvent({
											...event,
											tags: "Other",
										});
									}
								}}
							>
								Other
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
