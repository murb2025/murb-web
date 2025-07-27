import * as React from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterDropDownProps {
	onValueChange?: (value: string) => void;
}

export function FilterDropDown({ onValueChange }: FilterDropDownProps) {
	return (
		<Select defaultValue="today" onValueChange={onValueChange}>
			<SelectTrigger className="w-[180px] max-h-[28px] max-w-[104px] text-[12px] font-bold">
				<SelectValue placeholder="Today" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="today" className="text-[12px] font-bold">
						Today
					</SelectItem>
					<SelectItem value="this week" className="text-[12px] font-bold">
						This Week
					</SelectItem>
					<SelectItem value="this month" className="text-[12px] font-bold">
						This Month
					</SelectItem>
					<SelectItem value="all time" className="text-[12px] font-bold">
						All Time
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
