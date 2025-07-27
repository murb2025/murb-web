import React from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface IOtpProps {
	handleOtp: (_: string) => void;
	error?: string;
	disabled?: boolean;
}

const OTPInput = ({ handleOtp, error, disabled }: IOtpProps) => {
	const handleComplete = (value: string) => {
		handleOtp(value);
	};

	return (
		<div className="bg-white rounded-lg w-full p-2 shadow-md max-h-[54px] mt-4">
			<InputOTP
				maxLength={6}
				pattern={REGEXP_ONLY_DIGITS}
				onComplete={handleComplete}
				disabled={disabled}
				className="w-full focus-visible:ring-transparent bg-transparent h-[54px]"
			>
				<InputOTPGroup className="flex justify-between w-full gap-2">
					{[0, 1, 2, 3, 4, 5].map((index) => (
						<div key={index} className="flex-1">
							<InputOTPSlot
								index={index}
								className="w-full text-center border-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-md h-[34px]"
							/>
							<div className="w-full h-[1px] mt-2 bg-black"></div>
						</div>
					))}
				</InputOTPGroup>
			</InputOTP>
		</div>
	);
};

export default OTPInput;
