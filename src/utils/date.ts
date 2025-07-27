/**
 * Formats a date into a readable string format
 * @param date Date to format
 * @returns Formatted date string in the format "DD MMM YYYY"
 */
export const formatDate = (date: Date): string => {
	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

/**
 * Formats time into 12-hour format with AM/PM
 * @param time Time string in 24-hour format (HH:mm)
 * @returns Formatted time string in 12-hour format with AM/PM
 */
export const formatTime = (time: string): string => {
	const [hours, minutes] = time.split(":");
	const hour = parseInt(hours, 10);
	const ampm = hour >= 12 ? "PM" : "AM";
	const formattedHour = hour % 12 || 12;
	return `${formattedHour}:${minutes} ${ampm}`;
};

/**
 * Formats a date and time into a readable string
 * @param date Date object
 * @param time Time string in 24-hour format (HH:mm)
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date, time: string): string => {
	return `${formatDate(date)} ${formatTime(time)}`;
};
