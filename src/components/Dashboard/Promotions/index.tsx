import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface Plan {
	key: string;
	title: string;
	description: string[];
	price: string;
}

const plans: Plan[] = [
	{
		key: "basic",
		title: "Basic Package",
		description: [
			"Social Media Shoutout: One post 1 story on Murb's social media channels (Facebook, Instagram, Twitter",
			"Social Media Ad Campaign: Run ads on our social media platforms to give some clout to your event.",
			"Email Newsletter Feature: Inclusion in Murb’s monthly email newsletter sent to subscribers.",
		],
		price: "10, 000 INR",
	},
	{
		key: "standard",
		title: "Standard Package",
		description: [
			"Social Media Shoutout: One post 1 story on Murb's social media channels (Facebook, Instagram, Twitter",
			"Social Media Ad Campaign: Run ads on our social media platforms to give some clout to your event.",
			"Email Newsletter Feature: Inclusion in Murb’s monthly email newsletter sent to subscribers.",
		],
		price: "20, 000 INR",
	},
	{
		key: "premium",
		title: "Premium Package",
		description: [
			"Social Media Shoutout: One post 1 story on Murb's social media channels (Facebook, Instagram, Twitter",
			"Social Media Ad Campaign: Run ads on our social media platforms to give some clout to your event.",
			"Email Newsletter Feature: Inclusion in Murb’s monthly email newsletter sent to subscribers.",
		],
		price: "30, 000 INR",
	},
];

export default function Promotions() {
	const [currentPlan, setCurrentPlan] = useState<Plan>({
		key: "basic",
		title: "Basic Package",
		description: [
			"Social Media Shoutout: One post 1 story on Murb's social media channels (Facebook, Instagram, Twitter",
			"Social Media Ad Campaign: Run ads on our social media platforms to give some clout to your event.",
			"",
		],
		price: "10, 000 INR",
	});
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="bg-black text-white">Promote</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[700px]">
				<DialogHeader>
					<DialogTitle className="text-[24px] text-black">
						Do you want to Promote this event on the website ?
					</DialogTitle>
				</DialogHeader>
				<div className="w-full flex flex-col gap-4 mt-2">
					<div className="flex flex-col gap-2  items-center justify-center">
						<div className="flex  gap-4">
							{plans.map((plan) => (
								<button
									key={plan.key}
									className={`px-6 py-3 rounded-md text-[18px] font-medium shadow-xl ${
										currentPlan.key === plan.key
											? "bg-[#C3996B] text-white"
											: "bg-white text-[#1f1f1f66]"
									}`}
									onClick={() => setCurrentPlan(plan)}
								>
									{plan.title}
								</button>
							))}
						</div>
					</div>
					<div className="w-full">
						<div>
							<p className="text-[#1F1F1F] text-[20px] mb-1 mt-4">Price</p>
							<div className="p-3 border-2 border-[#C3996B] shadow-lg w-fit text-[20px] text-[#C3996B] font-semibold rounded-[8px]">
								{currentPlan.price}
							</div>
						</div>

						<div className="mt-8">
							<p className="text-[28px] text-black">{currentPlan.title}</p>
							<p className="text-[20px] text-black mt-3">Services Included:</p>

							<ul className="text-[#1F1F1F] text-[20px] list-disc list-inside mt-5">
								{currentPlan.description.map((desc, index) => (
									<li key={index} className="text-[20px] text-black">
										{desc}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button className="bg-black text-white text-[16px] font-medium">Promote</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
