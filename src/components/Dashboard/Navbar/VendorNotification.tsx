import { trpc } from "@/app/provider";
import { Bell, ExternalLink } from "lucide-react";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function VendorNotification() {
	const { data: notifications, isLoading } = trpc.notification.getNotifications.useQuery({
		limit: 10,
		page: 1,
	});

	const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation();
	const { mutateAsync: markAllAsRead, isLoading: isMarkingAllAsRead } = trpc.notification.markAllAsRead.useMutation();

	return (
		<Popover>
			<PopoverTrigger>
				<div className="relative cursor-pointer flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
					<Bell className="h-5 w-5 text-gray-700" />
					{notifications?.notifications &&
						notifications?.notifications.filter((notification) => !notification.isRead).length > 0 && (
							<div className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
								{notifications?.notifications.filter((notification) => !notification.isRead).length}
							</div>
						)}
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-full max-w-md min-w-96 p-4">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-semibold">Notifications</h1>
						{notifications?.notifications && notifications?.notifications?.length > 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={async () => {
									try {
										await markAllAsRead();
										toast.success("All notifications marked as read");
									} catch (error) {
										console.error(error);
										toast.error("Failed to mark all as read");
									}
								}}
								className="text-sm"
							>
								{isMarkingAllAsRead ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark all as read"}
							</Button>
						)}
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
						</div>
					) : notifications?.notifications && notifications.notifications.length > 0 ? (
						<div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
							{notifications.notifications.map((notification) => (
								<div
									key={notification.id}
									className={`p-3 rounded-lg ${
										notification.isRead ? "bg-gray-50" : "bg-blue-50"
									} hover:bg-gray-100 transition-colors`}
								>
									{notification.link ? (
										<Link
											href={notification.link}
											onClick={() => {
												markAsRead({ notificationId: notification.id });
											}}
											target="_blank"
											className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors group"
										>
											{notification.message}
											<ExternalLink className="h-3 w-3" />
										</Link>
									) : (
										<p className="text-sm text-gray-700">{notification.message}</p>
									)}
									<p className="text-xs text-gray-500 mt-1">
										{new Date(notification.createdAt).toLocaleString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">No notifications</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
