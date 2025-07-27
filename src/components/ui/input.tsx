import * as React from "react";

import { cn } from "@/utils/shadcn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				"flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-[20px] ring-offset-background file:border-0 placeholder:text-[20px] file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", // Removed focus-related classes
				className,
			)}
			style={{
				fontSize: "20px",
			}}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = "Input";

export { Input };
