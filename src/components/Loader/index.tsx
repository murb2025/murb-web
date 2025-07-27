import React from "react";
import Lottie from "lottie-react";
import { spinnerData } from "@/constants/loader";

const LottieSpinner = ({ size = 100 }) => {
	return (
		<div className="flex items-center justify-center mb-[80px] mt-[20px]">
			<div style={{ width: size, height: size }}>
				<Lottie animationData={spinnerData} loop={true} className="w-full h-full" />
			</div>
		</div>
	);
};

export default LottieSpinner;
