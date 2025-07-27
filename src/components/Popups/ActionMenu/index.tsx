import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import Typography from "@/components/Typography";

import { BsThreeDotsVertical } from "react-icons/bs";

export function ActionMenu() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="p-0 hover:bg-transparent py-0">
					<BsThreeDotsVertical className="cursor-pointer" />
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-fit p-0">
				<div className="flex flex-col gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded-md">
					<Typography weight="medium" className="text-[12px]">
						Copy Event Link
					</Typography>
				</div>
			</PopoverContent>
		</Popover>
	);
}
