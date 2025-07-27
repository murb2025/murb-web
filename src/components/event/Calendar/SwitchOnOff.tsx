import { Loader2, Lock, Unlock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/provider";
import { IBookingChart } from "@/types/event.type";
import { cn } from "@/lib/utils";

export default function SwitchOnOff({
	bookingEachChart,
	refetch,
	maximumParticipants,
	isMonthlySubscription,
}: {
	bookingEachChart: IBookingChart;
	refetch: () => void;
	maximumParticipants: Number;
	isMonthlySubscription: boolean;
}) {
	const [isBookingEnabled, setIsBookingEnabled] = useState(bookingEachChart?.isBookingEnabled ?? true);
	const [isLoading, setIsLoading] = useState(false);

	const toggleBookingMutation = trpc.event.toggleBookingEnabled.useMutation({
		onSuccess: () => {
			refetch();
			setIsBookingEnabled((prev) => !prev);
			setIsLoading(false);
			toast.success(`Booking ${isBookingEnabled ? "disabled" : "enabled"} successfully`);
		},
		onError: (error) => {
			console.error("Error toggling booking status:", error);
			setIsLoading(false);
			toast.error("Failed to update booking status. Please try again.");
		},
	});

	const handleToggleBooking = async () => {
		setIsLoading(true);

		try {
			toggleBookingMutation.mutate({
				bookingChartId: bookingEachChart?.id ?? "",
				isEnabled: !isBookingEnabled,
			});
		} catch (error) {
			setIsLoading(false);
		}
	};

	// Calculate booking percentage
	const bookingPercentage = Math.round((bookingEachChart.bookedSeats / Number(maximumParticipants)) * 100) || 0;

	return (
		<div className="flex items-center space-x-4 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
			<div className="flex-grow">
				<div className="flex items-center space-x-2">
					<div className="text-sm font-medium text-gray-700">{bookingEachChart.date}</div>
					<div className="text-xs text-gray-500">
						{bookingEachChart.slot?.startTime} - {bookingEachChart.slot?.endTime}
					</div>
				</div>

				{isMonthlySubscription ? (
					<div className="mt-1 flex items-center space-x-2">
						<div className={cn("text-xs font-semibold px-2 py-0.5 rounded", "bg-green-100 text-green-700")}>
							{bookingEachChart.bookedSeats} booked
						</div>
					</div>
				) : (
					<div className="mt-1 flex items-center space-x-2">
						<div
							className={cn(
								"text-xs font-semibold px-2 py-0.5 rounded",
								bookingPercentage > 75
									? "bg-red-100 text-red-700"
									: bookingPercentage > 50
										? "bg-yellow-100 text-yellow-700"
										: "bg-green-100 text-green-700",
							)}
						>
							{bookingEachChart.bookedSeats} / {maximumParticipants.toString()} booked
							<span className="ml-1">({bookingPercentage}%)</span>
						</div>
					</div>
				)}
			</div>

			<div className="flex items-center space-x-3">
				{isLoading ? (
					<Loader2 className="h-5 w-5 animate-spin text-blue-500" />
				) : (
					<>
						<Switch
							checked={isBookingEnabled}
							onCheckedChange={handleToggleBooking}
							disabled={isLoading}
							className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
						/>
						{isBookingEnabled ? (
							<Unlock className="h-5 w-5 text-green-600" />
						) : (
							<Lock className="h-5 w-5 text-red-600" />
						)}
					</>
				)}
			</div>
		</div>
	);
}
