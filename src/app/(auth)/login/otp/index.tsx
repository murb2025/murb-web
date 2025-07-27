import { Button } from "@/components/ui/button";
import Typography from "@/components/Typography";
import Image from "next/image";
import React, { useState } from "react";
import OTPInput from "@/components/account/inputs/otp";

const OTP = () => {
	const [otp, setOtp] = useState<string>();
	return (
		<div className="flex flex-col justify-evenly items-center p-2 w-full h-screen ">
			<Image
				src="/favicon.svg"
				alt="favicon"
				width={1920}
				height={1080}
				className="max-w-[250px] h-auto object-contain invert"
			/>

			<div className="flex flex-col gap-2 justify-start w-full">
				<Typography weight="bold">Enter OTP</Typography>

				<OTPInput handleOtp={setOtp} />
			</div>

			<div className="flex flex-col gap-4 w-full items-center mt-2 ">
				<Button className="text-white p-6 w-full">Log In</Button>
				<div className="flex flex-col items-center">
					<Typography className="">Don’t have an account ?</Typography>
					<Typography className="underline">Create Account</Typography>
				</div>
			</div>
		</div>
	);
};

export default OTP;
