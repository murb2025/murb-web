import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { trpc } from "@/app/provider";

export const VendorStatusDialog = ({ vendorId, currentStatus }: { vendorId: string; currentStatus: string }) => {
	const [open, setOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<"UNVERIFIED" | "VERIFIED" | "SUSPENDED">(
		currentStatus as "UNVERIFIED" | "VERIFIED" | "SUSPENDED",
	);
	const { mutateAsync: updateAccountStatus, isLoading } = trpc.admin.updateAccountStatus.useMutation();

	const handleSave = async () => {
		if (selectedStatus === currentStatus) {
			setOpen(false);
			return;
		}

		try {
			await updateAccountStatus({
				userId: vendorId,
				accountStatus: selectedStatus,
			});

			toast.success(`Vendor status updated successfully`);
			setOpen(false);
		} catch (error) {
			toast.error(`Failed to update vendor status: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="rounded-lg">
					Change Status
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Update Vendor Status</DialogTitle>
				</DialogHeader>

				<div className="py-4">
					<Select
						value={selectedStatus}
						onValueChange={(value) => setSelectedStatus(value as "UNVERIFIED" | "VERIFIED" | "SUSPENDED")}
						defaultValue={currentStatus}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="UNVERIFIED">Unverified</SelectItem>
							<SelectItem value="VERIFIED">Verified</SelectItem>
							<SelectItem value="SUSPENDED">Suspended</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
