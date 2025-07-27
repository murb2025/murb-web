import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItemProps {
	question: string;
	answer: React.ReactElement;
}

export function FAQItem({ question, answer }: FAQItemProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="bg-[#FFFCF9] rounded-lg py-2 sm:py-3 md:py-4 flex flex-wrap">
			<Button
				className="w-full hover:bg-inherit px-2 sm:px-4 md:px-6 bg-[#FFFCF9] py-3 sm:py-4 text-left flex justify-between items-center focus:outline-none transition-colors duration-200"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="font-normal sm:font-medium break-words text-base md:text-lg text-[#333333] leading-[20px] sm:leading-[24px] md:leading-[26px] flex-1 pr-4 whitespace-normal">
					{question}
				</span>
				<span
					className={`transform transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-22.5" : ""}`}
				>
					{isOpen ? (
						<X className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
					) : (
						<Plus className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
					)}
				</span>
			</Button>
			<div
				className={`transition-all duration-300 ease-in-out w-full ${
					isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
				} overflow-hidden`}
			>
				<div className="px-2 sm:px-4 md:px-6 pb-3 sm:pb-4">
					<div className="text-[#333333] text-base md:text-lg">{answer}</div>
				</div>
			</div>
		</div>
	);
}
