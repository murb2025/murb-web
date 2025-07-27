"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/app/provider";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PackageFormData {
	title: string;
	description: string;
	price: string;
	currency: string;
}

export default function AddonDialog() {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<PackageFormData>({
		title: "",
		description: "",
		price: "",
		currency: "INR", // Indian Rupee set by default
	});
	const queryClient = useQueryClient();

	const { mutateAsync: createAddonPackage, isLoading: isCreateAddonPackageLoading } =
		trpc.promotion.createAddonPackage.useMutation();

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
			await createAddonPackage({
				title: formData.title,
				description: formData.description,
				price: Number(formData.price),
				currency: formData.currency,
			});
			setFormData({
				title: "",
				description: "",
				price: "",
				currency: "INR",
			});
			setOpen(false);
			toast.success("Addon Service created successfully");
			queryClient.invalidateQueries(trpc.promotion.getAddonPackages.getQueryKey({}));
		} catch (error) {
			console.error("Error creating Addon Service:", error);
			setError("Error creating Addon Service. Please try again later.");
			toast.error("Error creating Addon Service. Please try again later.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Add New Addon</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Addon</DialogTitle>
						<DialogDescription>Fill in the details to create a new addon.</DialogDescription>
						{error && <p className="text-destructive">{error}</p>}
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid items-center gap-4">
							<Label htmlFor="packageName" className="">
								Title
							</Label>
							<Input
								id="packageName"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								// className="col-span-3"
								required
							/>
						</div>

						<div className="grid items-center gap-4">
							<Label htmlFor="packagePrice">Price</Label>
							<Input
								id="packagePrice"
								name="price"
								type="number"
								value={formData.price}
								onChange={handleInputChange}
								// className="col-span-3"
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
								id="packagePrice"
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
							{isCreateAddonPackageLoading ? "Loading..." : "Save Package"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
