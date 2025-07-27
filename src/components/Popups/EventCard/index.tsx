import { useOnClickOutside } from "@/hooks";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Star, Users } from "lucide-react";
import { useRef, useState } from "react";
import { ActionMenu } from "@/components/Popups/ActionMenu";
import Image from "next/image";

interface IEventCard {
	handleClose: (_: boolean) => void;
	eventData: any;
}

export default function EventCard({ handleClose, eventData }: IEventCard) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isFavorite, setIsFavorite] = useState(false);

	useOnClickOutside(cardRef, () => {
		handleClose(false);
	});

	const handleStarClick = () => {
		setIsFavorite(!isFavorite);
		// You can add additional logic here, like sending a request to update the favorite status on the server
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50">
			<div className="absolute inset-0 bg-black opacity-50"></div>
			<Card className="relative overflow-hidden w-[269px]  z-50" ref={cardRef}>
				<CardHeader className="px-4 py-3">
					<div className="relative h-[150px] bg-gray-900 text-white p-4 flex flex-col rounded-lg justify-between items-center text-center">
						<Image
							src={
								eventData?.images && eventData?.images?.length > 0
									? "https://murbfiles.s3.us-east-1.amazonaws.com/" + eventData?.images[0]
									: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyvetnLOz5AF4JPJGxqw0EJpwpBHl9swwqww&s"
							}
							alt="event image"
							className="w-full h-[155px] object-cover rounded-t-[12px]"
							width={260}
							height={155}
						/>
					</div>
				</CardHeader>
				<CardContent className="p-3.5 space-y-3 ">
					<div className="flex justify-between">
						<span
							className={`bg-[#A4F4E7] text-[#6F6F6F] font-md  text-[12px] px-2 py-1 rounded-full flex gap-1.5 items-center  ${eventData.status === "pending" ? "bg-[#ffca92] text-[#e09443]" : eventData.status === "unpublished" ? "bg-[#CFCECE] text-[#6F6F6F]" : "bg-[#D1FDDD] text-[#34A853]"}`}
						>
							<div
								className={`h-1.5 w-1.5 rounded-full ${eventData.status === "pending" ? "bg-[#e09443]" : eventData.status === "pending" ? "bg-[#6F6F6F]" : "bg-[#34A853]"}`}
							></div>
							{eventData?.status
								? eventData.status.charAt(0).toUpperCase() + eventData.status.slice(1).toLowerCase()
								: ""}
						</span>
						<div className="flex items-center space-x-2">
							<Switch />
							<span className="text-md font-semibold text-black ">Sold Out</span>
						</div>
					</div>
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold">
							{eventData?.title
								? eventData.title.charAt(0).toUpperCase() + eventData.title.slice(1).toLowerCase()
								: ""}
						</h2>
						<ActionMenu />
					</div>
					<div className="flex justify-between items-center space-x-2">
						<div className="text-[16px] font-gilroy font-medium text-gray-500">
							{eventData?.date
								? new Date(eventData.date)
										.toLocaleDateString("en-GB", {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
										})
										.split("/")
										.join("-")
								: ""}
						</div>
						<div className="text-[16px] font-gilroy font-medium text-gray-500">
							{eventData?.startingTime
								? new Date(`2000/01/01 ${eventData.startingTime}`).toLocaleTimeString("en-US", {
										hour: "2-digit",
										minute: "2-digit",
										hour12: true,
									})
								: ""}
						</div>
					</div>
					<div className="flex items-center justify-start text-[16px] font-gilroy font-medium text-gray-500">
						{eventData?.location}
					</div>
				</CardContent>
				<CardFooter className="flex justify-between items-center p-3.5">
					<div className="flex items-center text-[18px] font-gilroy font-semibold text-gray-500">
						<Users className="w-6 h-6 mr-2" />
						0/{eventData?.maximumParticipants}
					</div>
					<div
						className="flex items-center text-[18px] font-gilroy font-semibold text-gray-500 cursor-pointer"
						onClick={handleStarClick}
					>
						<Star
							className={`w-[18px] h-[18px] mr-2 ${isFavorite ? "text-yellow-400 fill-yellow-400" : ""}`}
						/>
						{eventData?.reviews?.rating?.toFixed(1) || 0}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
