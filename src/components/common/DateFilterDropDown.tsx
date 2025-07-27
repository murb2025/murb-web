import * as React from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateFilterDropDownProps {
	onValueChange: (value: string) => void;
	defaultValue: string;
}

export function DateFilterDropDown({ onValueChange, defaultValue }: DateFilterDropDownProps) {
	return (
		<Select defaultValue={defaultValue} onValueChange={onValueChange}>
			<SelectTrigger className="flex gap-2 px-4 py-0 text-base border [&>span]:line-clamp-none whitespace-nowrap border-black/20 shadow-none rounded-lg hover:bg-gray-50">
				<SelectValue
					className="w-fit text-center flex justify-center"
					placeholder={defaultValue || "this_month"}
				/>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem
						value="today"
						// className="text-[18px]"
					>
						Today
					</SelectItem>
					<SelectItem
						value="this_week"
						// className="text-[18px]"
					>
						This Week
					</SelectItem>
					<SelectItem
						value="this_month"
						// className="text-[18px]"
					>
						This Month
					</SelectItem>
					<SelectItem
						value="all_time"
						// className="text-[18px]"
					>
						All Time
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
