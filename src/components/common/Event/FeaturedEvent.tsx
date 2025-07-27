import { trpc } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const FeaturedEvent = ({ eventId, featured }: { eventId: string; featured: boolean }) => {
	const { mutateAsync: makeFeatured, isLoading: isFeaturedEventLoading } = trpc.admin.makeFeatured.useMutation();
	const { mutateAsync: removeFeatured, isLoading: isRemoveFeaturedLoading } = trpc.admin.removeFeatured.useMutation();
	const [isFeatured, setIsFeatured] = useState(featured || false);

	const handleFeaturedClick = async () => {
		try {
			if (isFeatured) {
				await removeFeatured({ eventId: eventId });
			} else {
				await makeFeatured({ eventId: eventId });
			}
			setIsFeatured(!isFeatured);
			toast.success(`Event ${isFeatured ? "unfeatured" : "featured"} successfully`);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update event");
		}
	};

	return (
		<>
			{isFeatured ? (
				<div className="absolute top-4 left-4 bg-white rounded-full px-2 py-1 shadow-md border border-[#C3996B]">
					<p className="text-[#C4A484] font-normal text-xs">Featured</p>
				</div>
			) : null}
			<Button
				className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md border border-[#C3996B] hover:bg-gray-50 transition-colors"
				aria-label="Bookmark event"
				onClick={(e) => {
					e.stopPropagation();
					handleFeaturedClick();
				}}
			>
				{isFeatured ? (
					<Sparkles className="w-6 h-6 bg fill-[#C4A484]" />
				) : (
					<Sparkles className="w-6 h-6 text-[#C4A484]" />
				)}
			</Button>
		</>
	);
};

export default FeaturedEvent;
