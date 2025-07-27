"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { PaymentMode } from "@prisma/client";

interface PaymentStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: { date: string; mode: PaymentMode; amount: number }) => void;
	isLoading?: boolean;
	defaultAmount?: number;
	isEditing?: boolean;
	defaultDate?: string;
	defaultMode?: PaymentMode;
}

export const PaymentStatusModal = ({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	defaultAmount = 0,
	isEditing = false,
	defaultDate = "",
	defaultMode = "" as PaymentMode,
}: PaymentStatusModalProps) => {
	const [date, setDate] = useState(defaultDate);
	const [mode, setMode] = useState<PaymentMode | "">(defaultMode);
	const [amount, setAmount] = useState(defaultAmount.toString());

	useEffect(() => {
		if (isOpen) {
			setDate(defaultDate);
			setMode(defaultMode);
			setAmount(defaultAmount.toString());
		}
	}, [isOpen, defaultDate, defaultMode, defaultAmount]);

	const handleSubmit = () => {
		onSubmit({
			date,
			mode: mode as PaymentMode,
			amount: Number(amount),
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Update Payment Details" : "Mark Payment as Done"}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<label htmlFor="date">Payment Date</label>
						<Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
					</div>
					<div className="grid gap-2">
						<label htmlFor="mode">Payment Mode</label>
						<Select value={mode} onValueChange={(value) => setMode(value as PaymentMode)}>
							<SelectTrigger>
								<SelectValue placeholder="Select payment mode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
								<SelectItem value="UPI">UPI</SelectItem>
								<SelectItem value="CASH">Cash</SelectItem>
								<SelectItem value="CHEQUE">Cheque</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<label htmlFor="amount">Amount</label>
						<Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
					</div>
				</div>
				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!date || !mode || !amount || isLoading}>
						{isLoading ? "Processing..." : isEditing ? "Update" : "Submit"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
