import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

const Card = ({
	className,
	children,
	...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
	const ref = useRef<HTMLDivElement>(null);
	const { resolvedTheme } = useTheme();
	const [colors, setColors] = useState({
		primary: resolvedTheme === "dark" ? "#151515" : "#f3f4f6",
		secondary: resolvedTheme === "dark" ? "#303030" : "rgb(251 251 251)",
	});
	useEffect(() => {
		if (!ref.current) return;
		if (resolvedTheme == "dark") {
			ref.current.style.background = "#151515";
			setColors({
				primary: "#151515",
				secondary: "#EBE6E680",
			});
		} else {
			ref.current.style.background = "#f3f4f6";
			setColors({
				primary: "#f3f4f6",
				secondary: "rgb(251 251 251)",
			});
		}
	}, [resolvedTheme]);
	return (
		<div
			ref={ref}
			onMouseMove={(event) => {
				const rect = event.currentTarget.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;

				if (ref.current) {
					ref.current.style.background = `radial-gradient(circle 100px at ${x}px ${y}px, ${colors.secondary}, ${colors.primary} 100%)`;
				}
			}}
			onMouseLeave={() => {
				if (ref.current) {
					ref.current.style.background = colors.primary;
				}
			}}
			className={` animate rounded-xl border border-foreground/20 shadow ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

export default Card;
