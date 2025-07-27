import { trpc } from "@/app/provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import PackageDialog from "@/components/admin/Pakages/package-dialog";
import toast from "react-hot-toast";
import type { FC } from "react";
import { Button } from "@/components/ui/button";

interface PackageCardProps {
	id: string;
	title: string;
	price: number;
	description: { title: string; description: string }[];
	isAdmin?: boolean;
}

export const PackageCard: FC<PackageCardProps> = ({ id, title, price, description, isAdmin = false }) => {
	const { mutateAsync: deletePackage } = trpc.promotion.deletePromotionPackage.useMutation();
	const handleDelete = async () => {
		try {
			await deletePackage({
				id: id,
			});
			toast.success("Package deleted successfully");
		} catch (error) {
			toast.error("Failed to delete package");
		}
	};

	const initialData = {
		id,
		packageName: title,
		packagePrice: price,
		packageDescription: description,
		packageCurrency: "INR",
	};
	return (
		<div className="max-w-[420px] w-full flex flex-col mx-auto flex-1 h-full">
			<Card className="rounded-3xl overflow-hidden border border-neutral-200 h-full flex flex-col">
				<CardHeader className="bg-[#C19A6B] p-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold text-center capitalize text-white">{title}</h2>
						{isAdmin && (
							<div className="flex items-center gap-2">
								<PackageDialog
									editMode={true}
									initialData={initialData}
									trigger={
										<Button variant="outline" size="icon" className="rounded-full">
											<Pencil className="h-4 w-4" />
										</Button>
									}
								/>
								{/* <Badge
									onClick={() => handleDelete()}
									variant="secondary"
									className="bg-zinc-800 cursor-pointer text-white p-1 hover:bg-zinc-800 rounded-full px-4"
								>
									<Trash2 className="h-4 w-4" />
								</Badge> */}
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="p-6 space-y-4 flex-grow">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1">
							<span className="text-2xl font-bold">₹</span>
							<span className="text-3xl font-bold">{price}</span>
						</div>
						{/* <Badge variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-800 rounded-full px-4">
							Popular
						</Badge> */}
					</div>

					<div className="space-y-6 flex-grow">
						{description.map((item, index) => (
							<div key={index} className="space-y-2">
								<h3 className="font-semibold capitalize">{item.title} :</h3>
								<p className="text-gray-600">{item.description}</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
