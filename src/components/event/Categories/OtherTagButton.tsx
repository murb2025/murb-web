import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Assuming these components are part of your component:
const OtherTagButton = ({ tags, setTags }: { tags: string; setTags: (tags: string) => void }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [customTagInput, setCustomTagInput] = useState("");

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<div
					className={`min-w-[120px] sm:min-w-[148px] h-[40px] sm:h-[44px] text-nowrap px-2 shadow-md rounded-md border border-[#C3996B] items-center justify-center flex cursor-pointer hover:scale-105 transition-all ease duration-300 ${
						tags === "Other" || tags.startsWith("Other (") ? "bg-[#C3996B] text-white" : ""
					}`}
					onClick={() => {
						if (tags === "Other" || tags.startsWith("Other (")) {
							setTags("");
							setCustomTagInput("");
						} else {
							setTags("Other");
							setIsOpen(true);
						}
					}}
				>
					{tags.startsWith("Other") ? tags : "Other"}
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-96">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Custom Tag</h4>
						<p className="text-sm text-muted-foreground">Enter your custom tag below</p>
					</div>
					<div className="space-y-2">
						<Input
							id="custom-tag"
							value={customTagInput}
							onChange={(e) => setCustomTagInput(e.target.value)}
							placeholder="Enter custom tag..."
							className="col-span-2 h-10"
						/>
						<div className="flex justify-end">
							<Button
								onClick={() => {
									if (customTagInput.trim() !== "") {
										setTags(`Other (${customTagInput.trim()})`);
										setIsOpen(false);
									}
								}}
								size="sm"
							>
								Add
							</Button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default OtherTagButton;
