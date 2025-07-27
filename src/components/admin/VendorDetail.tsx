"use client";
import { Button } from "@/components/ui/button";
import * as React from "react";
import Image from "next/image";
import { trpc } from "@/app/provider";
import EventSection from "../common/EventSection";
import VendorProfileModal from "./VendorProfileModal";
import toast from "react-hot-toast";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DateFilterDropDown } from "../common/DateFilterDropDown";
import { BuyerDetailTable } from "../common/BuyerDetailTable";
import { useEffect } from "react";
import { notFound } from "next/navigation";
import { Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { VendorStatusDialog } from "./VendorAccountStatus";

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

const VendorDetail = ({ vendorId }: { vendorId: string }) => {
	const [timeFilter, setTimeFilter] = React.useState<"today" | "this_week" | "this_month" | "all_time">("today");

	const [filters, setFilters] = React.useState<EventFilters>({
		title: "",
		categoryId: 0,
		subCategoryId: 0,
		eventType: "",
		status: "all",
		startDate: "",
		endDate: "",
		page: 1,
		limit: 10,
	});

	const { data: eventsData, isLoading: isEventLoading } = trpc.admin.getVendorEvents.useQuery({
		page: filters.page,
		limit: filters.limit,
		timeFilter: timeFilter,
		vendorId: vendorId,
	});

	if (isEventLoading) {
		return (
			<div className="min-h-screen grid place-content-center">
				<Loader className="animate-spin" />
			</div>
		);
	}

	if (!eventsData || !eventsData.vendorDetails || eventsData.vendorDetails.role !== "VENDOR") {
		return notFound();
	}

	return (
		<div className="flex flex-row items-center justify-between mb-6 pr-3">
			<div className="flex gap-2">
				<section className="relative w-10 h-10 md:w-24 md:h-24 rounded-full">
					<Avatar className="h-10 w-10 md:h-24 md:w-24 shadow-md overflow-hidden">
						<AvatarImage
							className="rounded-full object-cover w-full h-full"
							src={eventsData?.vendorDetails?.avatarUrl || ""}
							alt="@Host"
						/>
						<AvatarFallback className="rounded-full border-[1px] border-[#D9D9D9] text-2xl grid place-content-center h-10 w-10 md:h-24 md:w-24">
							{eventsData?.vendorDetails?.firstName?.charAt(0).toUpperCase() ||
								eventsData?.vendorDetails?.email?.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</section>
				<section className="grid place-content-center">
					<h1 className="font-bold ">
						{eventsData?.vendorDetails?.firstName} {eventsData?.vendorDetails?.lastName}
					</h1>
					<h1 className="text-sm md:text-base">{eventsData?.vendorDetails?.email}</h1>
				</section>
			</div>

			<div className="flex flex-col md:flex-row gap-4">
				{/*  */}
				<VendorStatusDialog vendorId={vendorId} currentStatus={eventsData?.vendorDetails?.accountStatus} />

				<VendorProfileModal vendorData={eventsData?.vendorDetails as any} />
			</div>
		</div>
	);
};

export default VendorDetail;
