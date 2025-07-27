import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface InputProps {
	handleInputType: (_: string) => void;
	handleMobile: (_: string) => void;
	handleEmail: (_: string) => void;
	disabled?: boolean;
	error?: string;
	isSelected?: boolean;
}

const EmailMobileInput = ({
	handleInputType,
	handleEmail,
	handleMobile,
	error,
	disabled = false,
	isSelected = false,
}: InputProps) => {
	const [inputValue, setInputValue] = useState("");
	const [inputType, setInputType] = useState("");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		// Simple check for email (contains @) or mobile (only digits)
		if (value.includes("@")) {
			setInputType("email");
			handleInputType("email");
			handleEmail(value);
		} else if (/^\d+$/.test(value)) {
			setInputType("mobile");
			handleInputType("phone");
			handleMobile(value);
		} else {
			setInputType("");
		}
	};

	const validateInput = () => {
		if (inputType === "email") {
			const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			return emailRegex.test(inputValue) ? "Valid email" : "Invalid email format";
		} else if (inputType === "mobile") {
			// Adjust this regex based on your specific mobile number format requirements
			const mobileRegex = /^\d{10}$/;
			return mobileRegex.test(inputValue) ? "Valid mobile number" : "Invalid mobile number format";
		}
		return "";
	};

	return (
		<div className="flex flex-col bg-white rounded-lg w-full justify-evenly shadow-md max-h-[54px] pl-3 focus-within:border-[#C3996B] focus-within:border ">
			<Input
				className={`focus-visible:outline-none border-none font-medium  bg-transparent placeholder:font-normal placeholder:text-[14px] h-[54px] ${isSelected ? "placeholder:text-murbBg" : "placeholder:text-black"} text-[16px] text-[#8E7777]`}
				placeholder="Enter Email"
				value={inputValue}
				onChange={handleInputChange}
				onKeyDown={validateInput}
				disabled={disabled}
			/>
		</div>
	);
};

export default EmailMobileInput;
