import { Plus, Minus } from "lucide-react";
import React from "react";

export default function Accordion({ title, description }: { title: string; description: string }) {
	return (
		<div className="border-b border-slate-200 bg-white px-4 rounded-xl">
			<details className="group">
				<summary className="w-full flex justify-between items-center py-5 text-slate-800 cursor-pointer list-none">
					<span className="text-[18px]">{title}</span>
					<span className="text-slate-800 transition-transform duration-300">
						<span className="group-open:hidden">
							<Plus size={12} />
						</span>
						<span className="hidden group-open:inline">
							<Minus size={12} />
						</span>
					</span>
				</summary>
				<div className="overflow-hidden transition-all duration-300 ease-in-out group-open:max-h-screen max-h-0 flex flex-col justify-center">
					<hr className="w-[90%] mb-2" />
					<div className="pb-5 text-base text-slate-500">{description}</div>
				</div>
			</details>
		</div>
	);
}
