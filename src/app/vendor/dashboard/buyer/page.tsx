"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { trpc } from "@/app/provider";
import { BuyerDetailTable } from "@/components/common/BuyerDetailTable";
import { ChevronRight, ChevronLeft, Download } from "lucide-react";
import { IoSearch } from "react-icons/io5";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
interface IEventPartial {
	id: string;
	title: string;
}
const Events = () => {
	const router = useRouter();
	const { data: session } = useSession();
	// const [buyers, setBuyers] = useState<any>([]);
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: undefined,
		to: undefined,
	});
	const [searchText, setSearchText] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | "ALL">("ALL");
	const [selectedEventId, setSelectedEventId] = useState<string>("");
	const [isExporting, setIsExporting] = useState(false);
	const [filteredBuyers, setFilteredBuyers] = useState<
		{
			email: string;
			eventName: string;
			dateOfBooking: Date;
			numberOfTickets: number;
			totalPrice: number;
		}[]
	>([]);

	const { data: bookingData, isLoading: isBookingDataLoading } =
		trpc.booking.getBookedTicketDetailsForVendor.useQuery(
			{
				timeFilter: "all_time",
				limit: 10,
				page: currentPage,
				status: selectedStatus,
				eventId: selectedEventId,
				searchText: searchText,
				vendorId: session?.user.id || "",
			},
			{
				enabled: !!session?.user.id,
			},
		);

	const { data: events } = trpc.event.getPublishedEvents.useQuery<IEventPartial[]>();

	useEffect(() => {
		if (bookingData?.bookingDetails) {
			setFilteredBuyers(bookingData?.bookingDetails as any);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Replace API calls with filtered dummy data
	useEffect(() => {
		let filtered = [...filteredBuyers];

		// Apply search filter
		if (searchText) {
			filtered = filtered.filter((buyer) => buyer?.email.toLowerCase() == searchText.toLowerCase());
		}

		// Apply date filter
		if (date?.from && date?.to) {
			filtered = filtered.filter((buyer) => {
				const buyerDate = new Date(buyer.dateOfBooking);
				return buyerDate >= date?.from! && buyerDate <= date?.to!;
			});
		}

		// Apply event filter
		// if (selectedEventId && selectedEventId !== "all") {
		// 	filtered = filtered.filter(
		// 		(buyer) => buyer.id === Number(selectedEventId),
		// 	);
		// }

		setFilteredBuyers(filtered);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText, date, selectedEventId]);

	const handleEventChange = (eventId: string) => {
		setSelectedEventId(eventId === "all" ? "" : eventId);
	};

	const exportToXLSX = async () => {
		try {
			setIsExporting(true);

			if (bookingData?.bookingDetails && bookingData.bookingDetails.length > 0) {
				// Prepare data for export
				const dataToExport = bookingData.bookingDetails.map((booking: any) => ({
					"Event Name": booking?.event?.title,
					"Buyer Email": booking?.user?.email,
					"Buyer Mobile": booking?.user?.mobileNumber || "N/A",
					"Number of Tickets": booking?.numberOfTickets,
					"Total Amount": `₹${new Intl.NumberFormat("en-IN").format(booking?.totalAmount || 0)}`,
					"Booking Date": booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "N/A",
					"Payment Status": booking.payment?.status || "N/A",
				}));

				// Create worksheet
				const worksheet = XLSX.utils.json_to_sheet(dataToExport);

				// Create workbook
				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, "Buyers List");

				// Generate filename with current date
				const fileName = `Buyers_List_${new Date().toISOString().split("T")[0]}`;

				// Export file
				XLSX.writeFile(workbook, `${fileName}.xlsx`);
				toast.success("Exported successfully");
			} else {
				toast.error("No data available to export");
			}
		} catch (error) {
			console.error("Error exporting data:", error);
			toast.error("Error exporting data");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<main className="flex-1 overflow-auto space-y-4">
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-black text-2xl font-medium">Buyer&apos;s List</h2>
				<div className="flex gap-2">
					<Button
						onClick={exportToXLSX}
						variant="outline"
						disabled={isExporting || isBookingDataLoading}
						className="flex items-center gap-2"
					>
						<Download className="h-4 w-4" />
						{isExporting ? "Exporting..." : "Export to Excel"}
					</Button>
					<Button
						onClick={() => {
							router.push("/event/create");
						}}
					>
						Create Event
					</Button>
				</div>
			</div>

			<div className="w-full flex flex-row justify-between items-center">
				<div className="w-full flex flex-row gap-2 items-center">
					<Select onValueChange={handleEventChange} value={selectedEventId || "all"}>
						<SelectTrigger className="max-w-[300px] max-h-[40px] text-[16px] text-[#6F6F6F]">
							<SelectValue placeholder="Select the Event" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Select the Listing</SelectItem>
							{events?.map((event: IEventPartial) => (
								<SelectItem key={event?.id} value={event?.id}>
									{event?.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						onValueChange={(value) => setSelectedStatus(value as PaymentStatus)}
						value={selectedStatus || "all"}
					>
						<SelectTrigger className="max-w-[300px] max-h-[40px] text-[16px] text-[#6F6F6F]">
							<SelectValue placeholder="Select the Event" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All</SelectItem>
							{Object.values(PaymentStatus).map((status: PaymentStatus) => (
								<SelectItem key={status} value={status}>
									{status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="flex flex-row justify-between w-[300px] h-[40px]  px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
						<input
							placeholder="Search"
							className="bg-none w-full outline-none text-[16px] text-[#6F6F6F]"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
						/>
						<IoSearch className="text-[#6D6D6D]" size={24} />
					</div>
				</div>
			</div>

			{/* Events List */}
			<div className="bg-white rounded-lg overflow-hidden w-full">
				<BuyerDetailTable
					data={(bookingData?.bookingDetails as any) || []}
					isEventLoading={isBookingDataLoading}
				/>
				{bookingData?.totalPages ? (
					<div className="flex flex-row items-center justify-center gap-4 mt-4">
						<Button
							variant={"ghost"}
							onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft />
						</Button>
						<span className="text-sm">
							Page {currentPage} of {bookingData?.totalPages}
						</span>
						<Button
							variant={"ghost"}
							onClick={() => setCurrentPage(Math.min(currentPage + 1, bookingData?.totalPages || 1))}
							disabled={currentPage === bookingData?.totalPages}
						>
							<ChevronRight />
						</Button>
					</div>
				) : null}
			</div>
		</main>
	);
};

export default Events;
