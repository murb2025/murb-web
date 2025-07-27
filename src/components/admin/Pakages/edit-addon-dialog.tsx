"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface EditAddonDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	addonData: {
		id: string;
		title: string;
		description: string;
		price: number;
		currency: string;
	};
}

export default function EditAddonDialog({ open, onOpenChange, addonData }: EditAddonDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		title: addonData.title,
		description: addonData.description,
		price: addonData.price.toString(),
		currency: addonData.currency,
	});
	const queryClient = useQueryClient();

	const { mutateAsync: updateAddonPackage, isLoading: isUpdateAddonPackageLoading } =
		trpc.promotion.updateAddonPackage.useMutation();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateAddonPackage({
				id: addonData.id,
				title: formData.title,
				description: formData.description,
				price: Number(formData.price),
				currency: formData.currency,
			});
			onOpenChange(false);
			toast.success("Addon Service updated successfully");
			queryClient.invalidateQueries(trpc.promotion.getAddonPackages.getQueryKey({}));
		} catch (error) {
			console.error("Error updating Addon Service:", error);
			setError("Error updating Addon Service. Please try again later.");
			toast.error("Error updating Addon Service. Please try again later.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Addon</DialogTitle>
						<DialogDescription>Edit the details of the addon.</DialogDescription>
						{error && <p className="text-destructive">{error}</p>}
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid items-center gap-4">
							<Label htmlFor="title" className="">
								Title
							</Label>
							<Input
								id="title"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								required
							/>
						</div>

						<div className="grid items-center gap-4">
							<Label htmlFor="price">Price</Label>
							<Input
								id="price"
								name="price"
								type="number"
								value={formData.price}
								onChange={handleInputChange}
								required
							/>
						</div>

						<div className="grid items-center gap-4">
							<Label className="">Currency</Label>
							<div className="">
								<Input value="Indian Rupee (₹)" disabled className="bg-muted" />
							</div>
						</div>

						<div className="grid gap-4">
							<Label className=" pt-2">Description</Label>
							<Input
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								className="col-span-3"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" variant={"outline"}>
							{isUpdateAddonPackageLoading ? "Loading..." : "Update Addon"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
