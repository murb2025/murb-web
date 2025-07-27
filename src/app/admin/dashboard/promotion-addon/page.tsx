"use client";
import { trpc } from "@/app/provider";
import AddonDialog from "@/components/admin/Pakages/addon-dialog";
import EditAddonDialog from "@/components/admin/Pakages/edit-addon-dialog";
import PackageDialog from "@/components/admin/Pakages/package-dialog";
import { PackageCard } from "@/components/Dashboard/Promotions/PackageCard";
import { Button } from "@/components/ui/button";
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
import { Edit2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
	const [selectedAddon, setSelectedAddon] = useState<any>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const utils = trpc.useContext();
	const { mutateAsync: deleteAddon } = trpc.promotion.deleteAddonPackage.useMutation({
		onSuccess: () => {
			toast.success("Addon deleted successfully");
			setIsDeleteDialogOpen(false);
			utils.promotion.getAddonPackages.invalidate();
		},
		onError: (error) => {
			console.error("Error deleting addon:", error);
			toast.error("Failed to delete addon");
		},
	});
	const { data: packagesData, isLoading: isPackagesLoading } = trpc.promotion.getPromotionPackages.useQuery(
		{
			page: 1,
			limit: 10,
			sortBy: "packagePrice",
			sortOrder: "asc",
		},
		{
			onError: (error) => {
				toast.error("Failed to load promotion packages");
				console.error("Error loading packages:", error);
			},
		},
	);
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
		<div>
			<div className="flex flex-col gap-4">
				<section className="flex justify-between md:flex-row flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h2 className="text-black text-2xl font-medium">Promotion Packages</h2>
						<p className="text-sm text-gray-500">Add a promotion packages</p>
					</div>
					<PackageDialog />
				</section>

				<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4 sm:my-6">
					{isPackagesLoading ? (
						<div className="text-center">Loading packages...</div>
					) : packagesData && packagesData?.data.length > 0 ? (
						packagesData?.data.map((item, idx) => (
							<PackageCard
								key={idx}
								id={item.id}
								title={item.packageName}
								price={item.packagePrice as any}
								description={(item.packageDescription as any) || []}
								isAdmin={true}
							/>
						))
					) : (
						<div className="col-span-full text-center">No packages available</div>
					)}
				</section>
			</div>

			<div className="flex flex-col gap-4">
				<section className="flex justify-between md:flex-row flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h2 className="text-3xl font-medium">Addons</h2>
						<p className="text-sm text-gray-500">Add a addon packages</p>
					</div>
					<AddonDialog />
				</section>

				<section className="flex flex-wrap gap-4 my-4 sm:my-6">
					{isAddonLoading ? (
						<div className="col-span-full text-center">Loading packages...</div>
					) : addonData && addonData?.data.length > 0 ? (
						addonData?.data.map((item, idx) => (
							<div key={idx} className="bg-white w-full md:w-[350px] border p-4 rounded-lg">
								<div className="flex justify-between items-center mb-2">
									<section className="font-semibold capitalize">{item.title}:</section>
									<div className="flex gap-2">
										<Button
											variant="outline"
											className="rounded-full"
											size="icon"
											onClick={() => {
												setSelectedAddon(item);
												setIsEditDialogOpen(true);
											}}
										>
											<Edit2 className="h-4 w-4" />
										</Button>
										{/* <Button
											variant="ghost"
											size="icon"
											onClick={() => {
												setSelectedAddon(item);
												setIsDeleteDialogOpen(true);
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button> */}
									</div>
								</div>
								<section>₹ {item.price.toString()}</section>
								<section>{item.description}</section>
							</div>
						))
					) : (
						<div className="text-center">No Addons available</div>
					)}
				</section>

				{/* Edit Dialog */}
				{selectedAddon && (
					<EditAddonDialog
						open={isEditDialogOpen}
						onOpenChange={setIsEditDialogOpen}
						addonData={selectedAddon}
					/>
				)}

				{/* Delete Confirmation Dialog */}
				{/* <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the addon package.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									if (selectedAddon) {
										deleteAddon({ id: selectedAddon.id });
									}
								}}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog> */}
			</div>
		</div>
	);
}
