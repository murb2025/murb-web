import * as React from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { eventSpecificTypeData, eventTypes } from "@/constants/event.constant";

interface EventTypeFilterProps {
	onValueChange?: (value: string) => void;
}

export function EventTypeFilter({ onValueChange }: EventTypeFilterProps) {
	return (
		<Select defaultValue="" onValueChange={onValueChange}>
			<SelectTrigger className="flex gap-2 px-4 py-0  text-base border border-black/20 shadow-none rounded-lg hover:bg-gray-50">
				<Filter className="w-4 h-4 text-black" /> <SelectValue className="w-fit" placeholder="Filter" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem
						value={"all"}
						// className="text-[18px]"
					>
						All
					</SelectItem>
					{eventTypes.map((event, idx) => (
						<SelectItem key={idx} value={event}>
							{event}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
