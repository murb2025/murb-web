import React from "react";
import { FaCircle } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { LiaCircleSolid } from "react-icons/lia";

interface IProgress {
	currentPage: Number;
}

const ProgressBar = ({ currentPage }: IProgress) => {
	return (
		<div className="flex flex-col items-center w-full justify-center relative mb-6 sm:mb-10">
			<div className="flex items-center">
				<div className="flex">
					{currentPage === 0 ? (
						<FaCircle className="w-6 h-6 sm:w-9 sm:h-9 text-[#C3996B]" />
					) : (
						<IoIosCheckmarkCircle className="w-7 h-7 sm:w-11 sm:h-11 text-[#C3996B]" />
					)}
					<div
						className={`w-20 sm:w-44 h-[2px] sm:h-[3px] my-auto ${currentPage !== 0 ? "bg-[#C3996B]" : "bg-[#C3996B33]"}`}
					></div>
				</div>
				<div className="flex">
					{currentPage === 0 ? (
						<LiaCircleSolid className="w-7 h-7 sm:w-11 sm:h-11 text-[#C3996B]" />
					) : currentPage === 1 ? (
						<FaCircle className="w-6 h-6 sm:w-9 sm:h-9 text-[#C3996B]" />
					) : (
						<IoIosCheckmarkCircle className="w-7 h-7 sm:w-11 sm:h-11 text-[#C3996B]" />
					)}
					<div
						className={`w-20 sm:w-44 h-[2px] sm:h-[3px] my-auto ${currentPage !== 0 && currentPage !== 1 ? "bg-[#C3996B]" : "bg-[#C3996B33]"}`}
					></div>
				</div>
				<div className="flex">
					{currentPage === 0 || currentPage === 1 ? (
						<LiaCircleSolid className="w-7 h-7 sm:w-11 sm:h-11 text-[#C3996B]" />
					) : currentPage === 2 ? (
						<FaCircle className="w-6 h-6 sm:w-9 sm:h-9 text-[#C3996B]" />
					) : (
						<IoIosCheckmarkCircle className="w-7 h-7 sm:w-11 sm:h-11 text-[#C3996B]" />
					)}
				</div>
			</div>
			<div className="flex gap-2 sm:gap-7 mt-2 sm:mt-4">
				<p className="w-18 sm:w-44 text-center text-xs sm:text-base text-[#4C2818] font-normal">
					General Information
				</p>
				<p className="w-20 sm:w-44 text-center text-xs sm:text-base text-[#4C2818] font-normal">Schedule</p>
				<p className="w-20 sm:w-44 text-center text-xs sm:text-base text-[#4C2818] font-normal">Booking</p>
			</div>
		</div>
	);
};

export default ProgressBar;
