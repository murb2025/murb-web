"use client";
import { trpc } from "@/app/provider";
import AddonPayButton from "@/components/admin/Pakages/AddonPayButton";
import AddonPaymentList from "@/components/common/AddonPaymentList";
import Script from "next/script";
import React from "react";
import toast from "react-hot-toast";

export default function AddonPage() {
	const { data: addonData, isLoading: isAddonLoading } = trpc.promotion.getAddonPackages.useQuery(
		{
			page: 1,
			limit: 10,
			sortBy: "price",
			sortOrder: "asc",
		},
		{
			onError: (error) => {
				toast.error("Failed to load addon packages");
				console.error("Error loading packages:", error);
			},
		},
	);

	return (
		<>
			<Script type="text/javascript" src="https://checkout.razorpay.com/v1/checkout.js" />

			<main className="flex-1 overflow-auto">
				<div className="bg-white rounded-lg">
					<div className="flex flex-row items-center justify-between mb-6">
						<h2 className="text-black text-2xl font-semibold">Add-on Services</h2>
					</div>
					<section className="flex flex-wrap gap-4 my-4 sm:my-6">
						{isAddonLoading ? (
							<div className="col-span-full text-center">Loading packages...</div>
						) : addonData && addonData?.data.length > 0 ? (
							addonData?.data.map((item, idx) => (
								<div key={idx} className="bg-white w-full sm:w-[350px] border p-4 rounded-lg">
									<section className="font-semibold capitalize">{item.title}:</section>
									<section>₹ {item.price.toString()}</section>
									<section>{item.description}</section>
								</div>
							))
						) : (
							<div className="text-center">No Addons available</div>
						)}
					</section>
				</div>
				<div className="flex justify-end my-4">
					<AddonPayButton />
				</div>

				<AddonPaymentList />
			</main>
		</>
	);
}
