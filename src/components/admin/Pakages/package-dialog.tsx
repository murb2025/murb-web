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

interface DescriptionItem {
	title: string;
	description: string;
}

interface PackageFormData {
	packageName: string;
	packageDescription: DescriptionItem[];
	packagePrice: string;
	packageCurrency: string;
}

interface PackageDialogProps {
	editMode?: boolean;
	initialData?: {
		id: string;
		packageName: string;
		packageDescription: DescriptionItem[];
		packagePrice: number;
		packageCurrency: string;
	};
	trigger?: React.ReactNode;
}

export default function PackageDialog({ editMode = false, initialData, trigger }: PackageDialogProps) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<PackageFormData>({
		packageName: initialData?.packageName || "",
		packageDescription: initialData?.packageDescription || [{ title: "", description: "" }],
		packagePrice: initialData?.packagePrice?.toString() || "",
		packageCurrency: initialData?.packageCurrency || "INR", // Indian Rupee set by default
	});
	const queryClient = useQueryClient();

	const { mutateAsync: createPromotionPackage, isLoading: isCreatePromotionPackageLoading } =
		trpc.promotion.createPromotionPackage.useMutation();

	const { mutateAsync: updatePromotionPackage, isLoading: isUpdatePromotionPackageLoading } =
		trpc.promotion.updatePromotionPackage.useMutation();

	const handleAddDescriptionItem = () => {
		setFormData({
			...formData,
			packageDescription: [...formData.packageDescription, { title: "", description: "" }],
		});
	};

	const handleRemoveDescriptionItem = (index: number) => {
		const newDescriptionItems = [...formData.packageDescription];
		newDescriptionItems.splice(index, 1);
		setFormData({
			...formData,
			packageDescription: newDescriptionItems,
		});
	};

	const handleDescriptionItemChange = (index: number, field: "title" | "description", value: string) => {
		const newDescriptionItems = [...formData.packageDescription];
		newDescriptionItems[index][field] = value;
		setFormData({
			...formData,
			packageDescription: newDescriptionItems,
		});
	};

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
			if (editMode && initialData) {
				await updatePromotionPackage({
					id: initialData.id,
					packageName: formData.packageName,
					packageDescription: formData.packageDescription,
					packagePrice: Number(formData.packagePrice),
					packageCurrency: formData.packageCurrency,
					packageDuration: 30,
				});
				toast.success("Promotion package updated successfully");
			} else {
				await createPromotionPackage({
					packageName: formData.packageName,
					packageDescription: formData.packageDescription,
					packagePrice: Number(formData.packagePrice),
					packageCurrency: formData.packageCurrency,
					packageDuration: 30,
				});
				toast.success("Promotion package created successfully");
			}

			setFormData({
				packageName: "",
				packageDescription: [{ title: "", description: "" }],
				packagePrice: "",
				packageCurrency: "INR",
			});
			setOpen(false);
			queryClient.invalidateQueries(trpc.promotion.getPromotionPackages.getQueryKey({}));
		} catch (error) {
			console.error("Error with promotion package:", error);
			setError(`Error ${editMode ? "updating" : "creating"} promotion package. Please try again later.`);
			toast.error(`Error ${editMode ? "updating" : "creating"} promotion package. Please try again later.`);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger || <Button>Add New Package</Button>}</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{editMode ? "Edit Package" : "Create New Package"}</DialogTitle>
						<DialogDescription>
							{editMode
								? "Edit the details of the package."
								: "Fill in the details to create a new package."}
						</DialogDescription>
						{error && <p className="text-destructive">{error}</p>}
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid items-center gap-4">
							<Label htmlFor="packageName">Package Name</Label>
							<Input
								id="packageName"
								name="packageName"
								value={formData.packageName}
								onChange={handleInputChange}
								className="col-span-3"
								required
							/>
						</div>

						<div className="grid  items-center gap-4">
							<Label htmlFor="packagePrice">Price</Label>
							<Input
								id="packagePrice"
								name="packagePrice"
								type="number"
								value={formData.packagePrice}
								onChange={handleInputChange}
								className="col-span-3"
								required
							/>
						</div>

						<div className="grid  items-center gap-4">
							<Label>Currency</Label>
							<div className="col-span-3">
								<Input value="Indian Rupee (₹)" disabled className="bg-muted" />
							</div>
						</div>

						<div className="grid gap-4">
							<Label className=" pt-2">Description</Label>
							<div className="col-span-3 space-y-4">
								{formData.packageDescription.map((item, index) => (
									<div key={index} className="space-y-2 p-4 border rounded-md">
										<div className="flex justify-between items-center">
											<Label htmlFor={`title-${index}`}>Title</Label>
											{formData.packageDescription.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => handleRemoveDescriptionItem(index)}
												>
													<Trash2 className="h-4 w-4 text-destructive" />
												</Button>
											)}
										</div>
										<Input
											id={`title-${index}`}
											value={item.title}
											onChange={(e) =>
												handleDescriptionItemChange(index, "title", e.target.value)
											}
											required
										/>
										<Label htmlFor={`description-${index}`}>Description</Label>
										<Textarea
											id={`description-${index}`}
											value={item.description}
											onChange={(e) =>
												handleDescriptionItemChange(index, "description", e.target.value)
											}
											className="min-h-[80px]"
											required
										/>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="mt-2"
									onClick={handleAddDescriptionItem}
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Description Item
								</Button>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" variant={"outline"}>
							{isCreatePromotionPackageLoading || isUpdatePromotionPackageLoading
								? "Loading..."
								: editMode
									? "Update Package"
									: "Save Package"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
