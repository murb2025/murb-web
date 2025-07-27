import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { LoaderCircle } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
	isLoading: boolean;
}

function LoadingButton({ isLoading, children, ...props }: LoadingButtonProps) {
	return (
		<Button className="text-white" disabled={isLoading} {...props}>
			{isLoading && <LoaderCircle className="w-6 h-6 mr-2 animate-spin" />}
			{children}
		</Button>
	);
}

export default LoadingButton;
