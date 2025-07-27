"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { trpc } from "@/app/provider";
import { DataTableProps, PaymentDetailTable } from "@/components/common/PaymentDetailTable";
import { ChevronRight, Search, Filter, Download } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { calculateAmountWithTax, VENDOR_CONVENIENCE_FEE_PERCENTAGE } from "@/constants/event.constant";

const Events = () => {
	// Date range filter
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: undefined,
		to: undefined,
	});

	const [searchText, setSearchText] = useState("");

	// Amount range filter
	const [amountRange, setAmountRange] = useState<[number, number]>([0, 10000]);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(10);

	// Loading state for export
	const [isExporting, setIsExporting] = useState(false);

	// Get payment details with filters
	const {
		data: bookingData,
		isLoading: isBookingDataLoading,
		refetch,
	} = trpc.booking.getPaymentDetails.useQuery(
		{
			page: currentPage,
			limit: limit,
			searchText: searchText,
			dateRange:
				date?.from && date?.to
					? {
						startDate: date.from,
						endDate: date.to,
					}
					: undefined,
			amountRange: {
				min: amountRange[0],
				max: amountRange[1],
			},
		},
		{
			enabled: true,
			keepPreviousData: false,
		},
	);

	// Get all payment details for export (no pagination)
	const { data: allPaymentData, refetch: refetchAllData } = trpc.booking.getPaymentDetailsForXlsx.useQuery(
		{
			page: 1,
			limit: 1000, // A large number to get all records
			searchText: searchText,
			dateRange:
				date?.from && date?.to
					? {
						startDate: date.from,
						endDate: date.to,
					}
					: undefined,
			amountRange: {
				min: amountRange[0],
				max: amountRange[1],
			},
		},
		{
			enabled: false, // Don't fetch automatically
		},
	);

	// Reset filters
	const resetFilters = () => {
		setSearchText("");
		setDate({ from: undefined, to: undefined });
		setAmountRange([0, 10000]);
		setCurrentPage(1);
	};

	// Apply filters and refresh data
	const applyFilters = () => {
		setCurrentPage(1);
		refetch();
	};

	// Export to XLSX function
	const exportToXLSX = async () => {
		try {
			setIsExporting(true);

			// Fetch all data with current filters
			await refetchAllData();

			if (allPaymentData?.paymentDetails && allPaymentData.paymentDetails.length > 0) {
				// Prepare data for export
				const dataToExport = allPaymentData.paymentDetails.map((payment) => {
					const { amountWithTax, convenienceFee, cgst, sgst, tds, tcs, amountPayableToVendor,netPayableToVendor,netPayable, commission, GSTOnCommission, tdsUnder194H, netCommision, tdsWithold, totalGST } = calculateAmountWithTax(
						Number(payment.totalAmount),
						payment.event.users?.vendor?.gstNumber ? true : false,
					);
					return {
						"Host": payment?.event?.host,
						"Payee": payment?.user.firstName + " " + (payment?.user.lastName ?? ""),
						"Event": payment?.event.title,
						"Event Date": payment?.event.startDate,
						"Event Cost" : payment.totalAmount,
						"Convenience Fee": convenienceFee,
						"Total GST": totalGST,
						"Amount Received" : amountWithTax,
						"TDS U/S 1940" : tds,
						"TCS under GST" : tcs,
						"Amount Payable To Vendor" : amountPayableToVendor,
						"Net Payable" : netPayable,
						"Commission" : commission,
						"GST On Commission" : GSTOnCommission,
						"TDS U/S 194H" : tdsUnder194H,
						"Net Commission" : netCommision,
						"TDS Withold" : tdsWithold,
						"Net Payable To Vendor" : netPayableToVendor,
					};
				});

				// Create worksheet
				const worksheet = XLSX.utils.json_to_sheet(dataToExport);

				// Create workbook
				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Details");

				// Generate filename with current date
				let fileName;
				if (date && date.from && date.to) {
					fileName = `Payment_Details_from_${format(date.from, "yyyy-MM-dd")}_to_${format(date.to, "yyyy-MM-dd")}`;
				} else {
					fileName = `Payment_Details_${format(new Date(), "yyyy-MM-dd")}`;
				}

				if (searchText) {
					fileName += "_of_" + searchText;
				}

				// Export file
				XLSX.writeFile(workbook, fileName + ".xlsx");
				toast.success("Exported successfully");
			}
		} catch (error) {
			console.error("Error exporting data:", error);
			toast.error("Error exporting data");
		} finally {
			setIsExporting(false);
		}
	};


	return (
		<main className="flex-1 overflow-auto">
			<div className="bg-white rounded-lg">
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
					<h2 className="text-black text-2xl font-medium">Payment List</h2>
					<div className="flex gap-2">
						<Button
							onClick={exportToXLSX}
							variant="outline"
							disabled={isExporting || isBookingDataLoading}
							className="flex items-center gap-2 w-full"
						>
							<Download className="h-4 w-4" />
							{isExporting ? "Exporting..." : "Export to Excel"}
						</Button>
						<Button onClick={resetFilters} variant="outline">
							Clear Filters
						</Button>
					</div>
				</div>

				<div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[30px] gap-4">
					<div className="w-full flex flex-wrap md:flex-nowrap gap-4">
						{/* Event Filter */}
						<Input
							placeholder="Search by Event, vendor Name..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="w-full h-10 placeholder:text-base"
						/>

						{/* Date Range Filter */}
						<div className="flex w-full items-center gap-2">
							<DatePickerWithRange setDate={setDate} date={date} />
							{
								<Button variant="outline" onClick={() => setDate({ from: undefined, to: undefined })}>
									Clear
								</Button>
							}
						</div>

						{/* Amount Range Filter */}
						<Popover>
							<PopoverTrigger asChild>
								<Button variant={"outline"} className="w-full justify-start text-left font-normal h-10">
									<Filter className="mr-2 h-4 w-4" />
									<span className="truncate">
										₹{amountRange[0]} - ₹{amountRange[1]}
									</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full">
								<div className="space-y-4">
									<h4 className="font-medium">Amount Range</h4>
									<div className="flex items-center justify-between gap-4">
										<Input
											type="number"
											value={amountRange[0]}
											onChange={(e) => setAmountRange([Number(e.target.value), amountRange[1]])}
											className="h-8 text-sm"
										/>
										<span>to</span>
										<Input
											type="number"
											value={amountRange[1]}
											onChange={(e) => setAmountRange([amountRange[0], Number(e.target.value)])}
											className="h-8 text-sm"
										/>
									</div>
									<Slider
										defaultValue={[0, 100000]}
										value={amountRange}
										min={0}
										max={100000}
										step={1000}
										onValueChange={(value: [number, number]) => setAmountRange(value)}
										className="mt-6"
									/>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* Payment Details Table */}
				<div className="bg-white rounded-lg overflow-hidden w-full">
					<PaymentDetailTable
						data={allPaymentData?.paymentDetails || []}
						isEventLoading={isBookingDataLoading}
						currentPage={currentPage}
						onRefresh={refetch}
					/>

					{allPaymentData?.pagination?.totalPages ? (
						<div className="flex flex-row items-center justify-center gap-4 mt-4">
							<Button
								variant={"ghost"}
								onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft />
							</Button>
							<span className="text-sm">
								Page {currentPage} of {allPaymentData.pagination.totalPages}
							</span>
							<Button
								variant={"ghost"}
								onClick={() =>
									setCurrentPage(Math.min(currentPage + 1, allPaymentData.pagination.totalPages))
								}
								disabled={currentPage === allPaymentData.pagination.totalPages}
							>
								<ChevronRight />
							</Button>
						</div>
					) : null}
				</div>
			</div>
		</main>
	);
};

export default Events;
