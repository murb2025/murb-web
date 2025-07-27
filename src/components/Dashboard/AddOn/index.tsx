import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import React from "react";

export default function AddOnCard({
	title,
	description,
}: {
	title: string;
	description: {
		text: string;
		subtext: string;
	}[];
}) {
	return (
		<Card className="rounded-3xl relative">
			<CardHeader className="bg-[#C3996B] rounded-ss-3xl rounded-se-3xl">
				<CardTitle className="text-white text-2xl font-normal">{title}</CardTitle>
			</CardHeader>
			<CardContent className="pt-4 grid gap-4">
				{description.map((item, idx) => (
					<div key={idx}>
						<section className="font-semibold">{item.text}:</section>
						<section className="text-balance text-base">{item.subtext}</section>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
