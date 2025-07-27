import React from "react";

export type FontFamily = "poppins" | "montserrat" | "gilroy";

export type FontSize = "xxs" | "xs" | "sm" | "s" | "md" | "lg" | "xl" | "xxl" | "xxxl" | "head-1" | "head-2" | "head-3";

export type FontWeight = "extra-light" | "light" | "regular" | "medium" | "semi-bold" | "bold";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
	/** The font family to use */
	family?: FontFamily;
	/** The font size to use */
	size?: FontSize;
	/** The font weight to use */
	weight?: FontWeight;
	/** The text to display */
	children: React.ReactNode;
	/** Node to use **/
	as?: React.ElementType;
}
