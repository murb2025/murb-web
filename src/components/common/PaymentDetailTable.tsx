"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loader";
import { MembersModal } from "../common/MembersModal";
import moment from "moment";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	calculateAmountWithTax,
	CONVENIENCE_FEE_PERCENTAGE,
	VENDOR_CONVENIENCE_FEE_PERCENTAGE,
} from "@/constants/event.constant";
import { PaymentStatusModal } from "./PaymentStatusModal";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import { PaymentMode } from "@prisma/client";

interface EventFilters {
	title: string;
	categoryId: number;
	subCategoryId: number;
	eventType: string;
	status: string;
	startDate: string;
	endDate: string;
	page: number;
	limit: number;
}
export interface DataTableProps {
	data: {
		id: string;
		userId: string;
		eventId: string;
		isGroupBooking: boolean;
		members: any[];
		totalAmount: number;
		totalAmountWithTax: number | null;
		tickets: any[];
		currency: string | null;
		paymentId: string | null;
		orderId: string;
		createdAt: Date;
		updatedAt: Date;
		bookingChartId: string | null;
		status: string;
		currencyIcon: string;
		event: {
			id: string;
			title: string;
			description: string;
			eventSpecificType: string | null;
			sportType: string | null;
			tags: string | null;
			host: string | null;
			images: string[];
			amenities: string[];
			termsAndConditions: string | null;
			language: string | null;
			slots: any;
			status: string;
			visibility: string;
			location: string;
			landmark: string | null;
			city: string;
			state: string;
			country: string;
			pincode: string;
			isHomeService: boolean;
			createdAt: Date;
			updatedAt: Date;
			eventType: string | null;
			isHaveSlots: boolean;
			isOnline: boolean;
			isTeamEvent: boolean;
			multipleDays: boolean;
			endDate: string | null;
			endingTime: string | null;
			maximumParticipants: number | null;
			minimumParticipants: number | null;
			slotDuration: number | null;
			startDate: string | null;
			startingTime: string | null;
			teamSize: number | null;
			vendorId: string | null;
			weekDays: string[];
			numberOfDays: number | null;
			seoTags: string[];
			isMonthlySubscription: boolean | null;
			users: {
				id: string;
				username: string | null;
				firstName: string | null;
				lastName: string | null;
				email: string | null;
				mobileNumber: string | null;
				avatarUrl: string | null;
				createdAt: Date;
				updatedAt: Date;
				accountStatus: string;
				role: string;
				vendor: {
					userId: string;
					govermentPhotoIdUrls: string[];
					aadharNumber: string | null;
					bankAccountNumber: string | null;
					gstNumber: string | null;
					ifscCode: string | null;
					panNumber: string | null;
					createdAt: Date;
					updatedAt: Date;
					percentageCut: number | null;
				} | null;
			} | null;
		};
		user: {
			id: string;
			username: string | null;
			firstName: string | null;
			lastName: string | null;
			email: string | null;
			mobileNumber: string | null;
			avatarUrl: string | null;
			createdAt: Date;
			updatedAt: Date;
			accountStatus: string;
			role: string;
		};
		paymentRollout: {
			id: string;
			bookingId: string;
			paymentDate: Date;
			paymentMode: PaymentMode;
			amount: number;
			doneById: string;
			createdAt: Date;
			updatedAt: Date;
			doneBy: {
				id: string;
				username: string | null;
				firstName: string | null;
				lastName: string | null;
				email: string | null;
				mobileNumber: string | null;
				avatarUrl: string | null;
				createdAt: Date;
				updatedAt: Date;
				accountStatus: string;
				role: string;
			};
		} | null;
	}[];
	isEventLoading: boolean;
	currentPage?: number;
	onRefresh?: () => void;
}

export const PaymentDetailTable = ({ data, isEventLoading, currentPage, onRefresh }: DataTableProps) => {
	const [selectedPayment, setSelectedPayment] = React.useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [selectedAmount, setSelectedAmount] = React.useState(0);
	const [isEditing, setIsEditing] = React.useState(false);

	const createPaymentRollout = trpc.booking.createPaymentRollout.useMutation({
		onSuccess: () => {
			toast.success("Payment rollout created successfully");
			setIsModalOpen(false);
			setSelectedPayment(null);
			onRefresh?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create payment rollout");
		},
	});

	const updatePaymentRollout = trpc.booking.updatePaymentRollout.useMutation({
		onSuccess: () => {
			toast.success("Payment details updated successfully");
			setIsModalOpen(false);
			setSelectedPayment(null);
			onRefresh?.();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update payment details");
		},
	});

	const handlePaymentRollout = (formData: { date: string; mode: PaymentMode; amount: number }) => {
		if (!selectedPayment) return;

		const selectedItem = data.find((item) => item.id === selectedPayment);
		if (isEditing && selectedItem?.paymentRollout) {
			updatePaymentRollout.mutate({
				rolloutId: selectedItem.paymentRollout.id,
				paymentDate: new Date(formData.date),
				paymentMode: formData.mode,
				amount: formData.amount,
			});
		} else {
			createPaymentRollout.mutate({
				bookingId: selectedPayment,
				paymentDate: new Date(formData.date),
				paymentMode: formData.mode,
				amount: formData.amount,
			});
		}
	};

	const tableHeaders = [
		"S.No",
		"Host",
		"Payee",
		"Event",
		"Date",
		"Event Cost",
		"Convenience Fee",
		"Total GST",
		"Amount Received",
		"TDS U/S 1940",
		"TCS under GST",
		"Amount Payable To Vendor",
		"Net Payable",
		"Commission",
		"GST On Commission",
		"TDS U/S 194H",
		"Net Commission",
		"TDS Withold",
		"Net Payable To Vendor",
		"Payment Rollout",
		"Action"
	];

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead className={" text-center whitespace-nowrap"} key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{!isEventLoading &&
						data &&
						data.length > 0 &&
						data.map((item, index: number) => {
							const { amountWithTax, convenienceFee, cgst, sgst, tds, tcs, amountPayableToVendor, netPayableToVendor, netPayable, commission, GSTOnCommission, tdsUnder194H, netCommision, tdsWithold, totalGST } = calculateAmountWithTax(
								Number(item.totalAmount),
								item?.event?.users?.vendor?.gstNumber ? true : false
							);

							return (
								<TableRow key={index}>
									<TableCell className="border-l-[2px] border-r-[1px] text-center text-[14px] font-normal text-[#1C1C1C]">
										{index + 1 + (currentPage ? currentPage - 1 : 0) * 10}
									</TableCell>
									<TableCell className="border-r-[2px] whitespace-nowrap text-center text-[14px] font-normal text-[#1C1C1C]">
										<div className="flex flex-row items-center gap-2">
											<Avatar>
												<AvatarImage
													src={item.event.users?.avatarUrl || "/placeholder.svg"}
													alt={item.event.title || ""}
												/>
												<AvatarFallback>{item.event.users?.firstName?.charAt(0).toUpperCase()}</AvatarFallback>
											</Avatar>
											<div className="">
												<p className="font-medium text-left capitalize">
													{item.event.users?.firstName ? 
														`${item.event.users.firstName} ${item.event.users.lastName || ""}` 
														: "Unknown Vendor"
													}
												</p>
												<p className="text-sm text-gray-500">{item.event.users?.email}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="border-r-[2px] whitespace-nowrap text-center text-[14px] font-normal text-[#1C1C1C]">
										<div className="flex flex-row items-center gap-2">
											<Avatar>
												<AvatarImage
													src={item.user.avatarUrl || "/placeholder.svg"}
													alt={item.user.email || ""}
												/>
												<AvatarFallback>
													{item.user.email?.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="">
												<p className="font-medium text-left capitalize">
													{item.user.firstName ? 
														`${item.user.firstName} ${item.user.lastName || ""}` 
														: "Unknown User"
													}
												</p>
												<p className="text-sm text-gray-500">{item.user.email}</p>
											</div>
										</div>
									</TableCell>
									<TableCell className="border-l-[2px] whitespace-nowrap border-r-[1px] text-center text-[14px] font-normal text-[#1C1C1C]">
										{item.event.title}
									</TableCell>
									<TableCell className="border-l-[2px] whitespace-nowrap border-r-[1px] text-center text-[14px] font-normal text-[#1C1C1C]">
										<span className="text-gray-500 block">
											{moment(item.createdAt).format("DD, MMM YYYY")}
										</span>
										<span className="text-gray-500 block">
											{moment(item.createdAt).format("hh:mm a")}
										</span>
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {item.totalAmount}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(convenienceFee.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {(totalGST).toFixed(2)}
									</TableCell>
									<TableCell className="border-l-[2px] whitespace-nowrap text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {(amountWithTax).toFixed(2)}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(tds.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(tcs.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(amountPayableToVendor.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(netPayable.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] border-r-[1px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(commission.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(GSTOnCommission.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(tdsUnder194H.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(netCommision.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(tdsWithold.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										₹ {parseFloat(netPayableToVendor.toFixed(2))}
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
										<div className="flex items-center justify-center gap-2">
											{item.paymentRollout ? (
												<>
													<span className="text-green-600">Paid</span>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setSelectedPayment(item.id);
															setSelectedAmount(item.paymentRollout!.amount);
															setIsModalOpen(true);
															setIsEditing(true);
														}}
													>
														Edit
													</Button>
												</>
											) : (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setSelectedPayment(item.id);
														setSelectedAmount(Number(item.totalAmount * (item.event.users?.vendor?.percentageCut || 0) / 100));
														setIsModalOpen(true);
														setIsEditing(false);
													}}
												>
													Mark as Paid
												</Button>
											)}
										</div>
									</TableCell>
									<TableCell className="border-l-[2px] text-center text-[14px] font-normal text-[#1C1C1C]">
									<Link href={`/admin/dashboard/vendor/details/${item.event.users?.id}`}>View</Link>
									</TableCell>
								</TableRow>
							);
						})}
				</TableBody>
			</Table>

			{isEventLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isEventLoading && data.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}

			<PaymentStatusModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedPayment(null);
					setIsEditing(false);
				}}
				onSubmit={handlePaymentRollout}
				isLoading={createPaymentRollout.isLoading || updatePaymentRollout.isLoading}
				defaultAmount={selectedAmount}
				isEditing={isEditing}
				defaultDate={
					(isEditing &&
						data
							.find((item) => item.id === selectedPayment)
							?.paymentRollout?.paymentDate.toISOString()
							.split("T")[0]) ||
					""
				}
				defaultMode={
					isEditing
						? data.find((item) => item.id === selectedPayment)?.paymentRollout?.paymentMode ||
						("" as PaymentMode)
						: ("" as PaymentMode)
				}
			/>
		</>
	);
};
