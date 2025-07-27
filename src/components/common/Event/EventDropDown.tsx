import { trpc } from "@/app/provider";
import { Button } from "@/components/ui";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Dot, EllipsisVertical, FilePenLine, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function EventDropDown({ eventId }: { eventId: string }) {
	const { mutateAsync: deleteEvent, isError, error: errorMessage } = trpc.event.deleteEvent.useMutation();
	const [loading, setLoading] = useState(false);
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const pathname = usePathname();

	const queryClient = useQueryClient();

	const handleDeleteEvent = async () => {
		try {
			setLoading(true);
			await deleteEvent({ eventId: eventId });
			queryClient.invalidateQueries(trpc.event.getVendorEvents.getQueryKey({}));
			queryClient.invalidateQueries(trpc.admin.getEvents.getQueryKey({}));
			toast.success("Event deleted successfully");
		} catch (error) {
			toast.error(errorMessage?.message || "Failed to delete event");
		} finally {
			setLoading(false);
			setShowDeleteAlert(false);
		}
	};

	const openDeleteAlert = () => {
		setShowDeleteAlert(true);
	};

	if (!pathname.includes("events")) {
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="rounded-full" size="icon">
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Event Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{pathname.includes("vendor") && (
						<Link href={`/vendor/dashboard/events/edit/${eventId}`}>
							<DropdownMenuItem className="flex items-center gap-2">
								<FilePenLine className="w-4 h-4 text-blue-500" /> Edit Event
							</DropdownMenuItem>
						</Link>
					)}
					<DropdownMenuItem onClick={openDeleteAlert} className="flex items-center gap-2">
						<Trash2 className="w-4 h-4 text-red-500" /> Delete Event
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription className="text-lg text-gray-500 font-medium">
							This action cannot be undone. Deleting this event will permanently remove the following
							data:
							<ul className="my-2 text-base text-gray-500 space-y-1">
								<li>• Event details and information</li>
								<li>• Featured and trending entries</li>
								<li>• All bookmarks for this event</li>
								<li>• Promotion and addon payments</li>
								<li>• All reviews and their comments</li>
								<li>• Booking details types</li>
								<li>• All booking charts and associated bookings</li>
								<li>• Any remaining bookings linked to this event</li>
							</ul>
							This operation is performed as a database transaction and cannot be reversed once completed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button onClick={handleDeleteEvent} disabled={loading} className="bg-red-600 hover:bg-red-700">
							{loading ? "Deleting..." : "Delete Event"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
