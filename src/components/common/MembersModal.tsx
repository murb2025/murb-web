import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface Member {
	name: string;
	email: string;
	phone: string;
}

interface MembersModalProps {
	members: Member[];
}

export function MembersModal({ members }: MembersModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<p
					onClick={() => setIsOpen(true)}
					className="text-[#1C1C1C] decoration-gray-300 underline underline-offset-4 cursor-pointer"
				>
					View
				</p>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Members List</DialogTitle>
				</DialogHeader>

				<Table>
					<TableHeader>
						<TableRow className="text-xl">
							<TableHead>Id</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{members.map((member, idx) => (
							<TableRow key={member.email} className="text-lg">
								<TableCell>{idx + 1}</TableCell>
								<TableCell>{member.name}</TableCell>
								<TableCell>{member.email}</TableCell>
								<TableCell>{member.phone}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>
		</Dialog>
	);
}
