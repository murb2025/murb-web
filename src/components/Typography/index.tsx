import React from "react";
import { TypographyProps } from "./types";
import classes from "@/utils/shadcn";

const fontFamilies = {
	poppins: "font-poppins",
	montserrat: "font-montserrat",
	gilroy: "font-gilroy",
};

const fontSizes = {
	xxs: "text-xxs",
	xs: "text-xs",
	sm: "text-sm",
	s: "text-s",
	md: "text-base", // Tailwind uses 'base' for 1rem
	lg: "text-lg",
	xl: "text-xl",
	xxl: "text-2xl",
	xxxl: "text-3xl",
	"head-1": "text-4xl",
	"head-2": "text-2.5xl",
	"head-3": "text-2xl",
};

const fontWeights = {
	"extra-light": "font-extralight",
	light: "font-light",
	regular: "font-normal",
	medium: "font-medium",
	"semi-bold": "font-semibold",
	bold: "font-bold",
};

const Typography: React.FC<TypographyProps> = ({
	children,
	family = "gilroy",
	size = "md",
	weight = "regular",
	as = "span",
	className = "",
	...rest
}) => {
	const Component = as || "span";
	const fontFamilyClass = fontFamilies[family] || fontFamilies.gilroy;
	const fontSizeClass = fontSizes[size] || fontSizes.md;
	const fontWeightClass = fontWeights[weight] || fontWeights.regular;

	return (
		<Component
			className={classes(
				"leading-tight align-middle",
				fontFamilyClass,
				fontSizeClass,
				fontWeightClass,
				className,
			)}
			{...rest}
		>
			{children}
		</Component>
	);
};

export default Typography;
