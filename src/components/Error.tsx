import React from "react";
import { Button } from "@/components/ui/button";
import Typography from "@/components/Typography";

interface ErrorPageProps {
	title: string;
	description: string;
	button: {
		label: string;
		action: any;
	};
}

const ErrorPage: React.FC<ErrorPageProps> = ({ title, button }) => {
	return (
		<>
			<div className="w-full h-screen flex justify-center items-start flex-col gap-9 bg-[url('/images/lost.png')] bg-contain bg-right-bottom bg-no-repeat px-[5%]">
				<Typography as="h1" size="head-2" weight="bold">
					{title}
				</Typography>
				<Button onClick={() => button.action()}>{button.label}</Button>
			</div>
		</>
	);
};

export default ErrorPage;
