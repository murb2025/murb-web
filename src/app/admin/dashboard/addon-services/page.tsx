"use client";
import { trpc } from "@/app/provider";
import { AddonPaymentTable } from "@/components/common/AddonPaymentTable";
import React from "react";

export default function AddonServicesPage() {
	const { data: packagesData, isLoading: isPackagesLoading } = trpc.promotion.getAddonPayments.useQuery({
		page: 1,
		limit: 10,
	});

	return (
		<div>
			<div className="flex flex-row items-center justify-between mb-6">
				<h2 className="text-black text-2xl font-medium">Addon Services Payment List</h2>
			</div>
			<AddonPaymentTable
				data={(packagesData?.data as any) || []}
				isEventLoading={isPackagesLoading}
				currentPage={(packagesData?.pagination.page || 0) - 1}
			/>
		</div>
	);
}
