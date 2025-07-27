import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const classes = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export default classes;
export const cn = classes;
