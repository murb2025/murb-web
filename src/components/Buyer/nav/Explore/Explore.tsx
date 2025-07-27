import React, { useEffect, useState } from "react";
import { RefreshCcw, X } from "lucide-react";
import { SidebarCategory } from "./SidebarCategory";
import { SportCategories } from "./SportCategories";
import { SportsList } from "./SportsList";
import { Button } from "@/components/ui/button";
import useQuery from "@/hooks/useQuery";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MdOutlineExplore } from "react-icons/md";
import { useRouter } from "next/navigation";

export const Explore = ({
	onOpenHamburg,
	showText,
}: {
	showText: boolean;
	onOpenHamburg?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [selectedCategory, setSelectedCategory] = useState("");
	const router = useRouter();
	const [selectedSportCategory, setSelectedSportCategory] = useState("");
	const [selectedSport, setSelectedSport] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const { getQuery, updateAndPushQuery } = useQuery();

	const category = getQuery("category");
	const sportCategory = getQuery("sportCategory");
	const sport = getQuery("sport");

	const handleFilter = () => {
		const queryParams: Record<string, string> = { event: "explore" };

		if (selectedCategory) queryParams.category = selectedCategory;
		if (selectedSportCategory) queryParams.sportCategory = selectedSportCategory;
		if (selectedSport) queryParams.sport = selectedSport;

		updateAndPushQuery(queryParams);
		setIsOpen(false);
		onOpenHamburg && onOpenHamburg(false);
	};

	useEffect(() => {
		setSelectedCategory(category);
		setSelectedSport(sport);
		setSelectedSportCategory(sportCategory);
	}, [category, sport, sportCategory]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				onOpenHamburg && onOpenHamburg(open);
			}}
		>
			<DialogTrigger asChild>
				<div className="flex justify-center w-full gap-2 py-2 sm:py-3 items-center duration-200 hover:scale-105 cursor-pointer">
					<MdOutlineExplore className="w-6 h-6" />
					{showText && <p className="md:font-semibold text-base font-gilroy">Explore</p>}
				</div>
			</DialogTrigger>
			<DialogContent className="w-full md:max-w-7xl md:min-w-[800px] h-[92vh] overflow-y-auto">
				{/* <div className="fixed z-[40] inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto pt-[88px]"> */}
				<div className="bg-white rounded-[30px] rounded-t-none">
					<div className="flex flex-col md:flex-row items-center justify-between">
						<h2 className="text-2xl md:text-3xl mb-4 font-medium md:px-6">
							Hey! What are you looking for?
						</h2>
					</div>

					<div className="flex md:hidden flex-col md:flex-row gap-4 justify-center items-center">
						<SidebarCategory selected={selectedCategory} onSelect={setSelectedCategory} />
						<div className="flex-1 px-2 md:px-6 w-full md:max-w-[65%] md:ml-4 flex flex-col gap-3">
							{selectedCategory && (
								<div className="flex flex-col">
									<h3 className="text-xl text-center md:text-left font-medium mb-4">Type of Sport</h3>
									<SportCategories
										selected={selectedSportCategory}
										onSelect={setSelectedSportCategory}
									/>
								</div>
							)}
							{selectedSportCategory && (
								<div className="flex-1 flex flex-col overflow-auto px-2">
									<h3 className="text-xl font-medium mb-4 text-center md:text-left ">
										List of Sports{" "}
									</h3>
									<SportsList
										selected={selectedSport}
										selectedSportCategory={selectedSportCategory}
										onSelect={setSelectedSport}
									/>
								</div>
							)}

							<div className="flex md:flex-row flex-col justify-center gap-4">
								<Button
									onClick={handleFilter}
									disabled={!selectedCategory || !selectedSportCategory || !selectedSport}
									className="bg-black text-white rounded-md px-6 py-2 text-base hover:bg-gray-800 transition-colors"
								>
									Apply All
								</Button>
								<Button
									variant={"outline"}
									size={"default"}
									onClick={() => {
										router.push("/");
										setSelectedCategory("");
										setSelectedSportCategory("");
										setSelectedSport("");
										setIsOpen(false);
										onOpenHamburg && onOpenHamburg(false);
									}}
									className="md:hidden rounded-md px-6 py-2 text-base transition-colors"
								>
									<X className="w-6 h-6" />
									Reset
								</Button>
								<Button
									variant={"outline"}
									size={"default"}
									onClick={() => {
										router.push("/");
										setSelectedCategory("");
										setSelectedSportCategory("");
										setSelectedSport("");
									}}
									className="hidden md:flex rounded-md px-6 py-2 text-base transition-colors"
								>
									<X className="w-6 h-6" />
									Reset
								</Button>
							</div>
						</div>
					</div>
					<div className="hidden md:flex flex-col md:flex-row gap-4 justify-center items-center">
						<SidebarCategory selected={selectedCategory} onSelect={setSelectedCategory} />
						<div className="flex-1 px-2 md:px-6 w-full md:max-w-[65%] md:ml-4 flex flex-col gap-3">
							<div className="flex flex-col">
								<h3 className="text-xl font-medium mb-4">Type of Sport</h3>
								<SportCategories selected={selectedSportCategory} onSelect={setSelectedSportCategory} />
							</div>

							<div className="flex-1 flex flex-col overflow-auto px-2">
								<h3 className="text-xl font-medium mb-4">List of Sports </h3>
								<SportsList
									selected={selectedSport}
									selectedSportCategory={selectedSportCategory}
									onSelect={setSelectedSport}
								/>
							</div>

							<div className="flex md:flex-row flex-col justify-center gap-4">
								<Button
									onClick={handleFilter}
									className="bg-black text-white rounded-md px-6 py-2 text-base hover:bg-gray-800 transition-colors"
								>
									Apply All
								</Button>
								<Button
									variant={"outline"}
									size={"default"}
									onClick={() => {
										router.push("/");
										setSelectedCategory("");
										setSelectedSportCategory("");
										setSelectedSport("");
										setIsOpen(false);
									}}
									className="md:hidden rounded-md px-6 py-2 text-base transition-colors"
								>
									<X className="w-6 h-6" />
									Reset
								</Button>
								<Button
									variant={"outline"}
									size={"default"}
									onClick={() => {
										router.push("/");
										setSelectedCategory("");
										setSelectedSportCategory("");
										setSelectedSport("");
									}}
									className="hidden md:flex rounded-md px-6 py-2 text-base transition-colors"
								>
									<X className="w-6 h-6" />
									Reset
								</Button>
							</div>
						</div>
					</div>
				</div>
				{/* </div> */}
			</DialogContent>
		</Dialog>
	);
};
