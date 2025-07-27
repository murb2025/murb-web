import { trpc } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronsUp, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const TrendingEventIcon = ({ eventId, trending }: { eventId: string; trending: boolean }) => {
	const { mutateAsync: makeTrending, isLoading: isTrendingEventLoading } = trpc.trending.makeTrending.useMutation();
	const { mutateAsync: removeTrending, isLoading: isRemoveTrendingLoading } =
		trpc.trending.removeTrending.useMutation();
	const [isTrending, setIsTrending] = useState(trending || false);

	const handleFeaturedClick = async () => {
		try {
			if (isTrending) {
				await removeTrending({ eventId: eventId });
			} else {
				await makeTrending({ eventId: eventId });
			}
			setIsTrending(!isTrending);
			toast.success(`Event ${isTrending ? "untrended" : "trended"} successfully`);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update event");
		}
	};

	return (
		<>
			{isTrending ? (
				<div className="absolute top-4 left-4 bg-white rounded-full px-2 py-1 shadow-md border border-[#C3996B]">
					<p className="text-[#C4A484] font-normal text-xs">Trending</p>
				</div>
			) : null}
			<Button
				className={`absolute bottom-4 right-4 ${isTrending ? "bg-murbBg" : "bg-white"} rounded-full p-2 shadow-md border border-[#C3996B] hover:bg-gray-400 transition-colors`}
				aria-label="Bookmark event"
				onClick={(e) => {
					e.stopPropagation();
					handleFeaturedClick();
				}}
			>
				<ChevronsUp className={`!w-6 !h-6 ${isTrending ? "text-white" : "text-[#C4A484]"}`} />
			</Button>
		</>
	);
};

export default TrendingEventIcon;
