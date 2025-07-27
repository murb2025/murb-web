// function to implement a sleep function
export const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

// function to declare class names while using modular styling files
export const stylesConfig =
	(styles: any, prefix: string = "") =>
	(...args: any[]) => {
		const classes: any[] = [];
		args.forEach((arg) => {
			if (typeof arg === "string") classes.push(styles[`${prefix}${arg}`]);
			else if (typeof arg === "object")
				Object.keys(arg).forEach((key) => {
					if (arg[key]) classes.push(styles[`${prefix}${key}`]);
				});
		});
		return classes.join(" ");
	};

export const openLink = (link: string) => window.open(link, "_blank");

// function to covert in lowercase, removing spaces, and removing special characters, uppercase to lowercase
export const slugify = (text: string) => {
	return text
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "-");
};
