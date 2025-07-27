import Image from "next/image";
import React from "react";
import { Input } from "@/components/ui/input";

const PhoneInput = () => {
	return (
		<div className="flex flex-row bg-white rounded-lg w-full p-3 justify-evenly shadow-md">
			<Image src={"/phone.svg"} alt="phone" height={25} width={25} />

			<select className="w-fit   focus-visible:ring-transparent  rounded-md bg-transparent border-none">
				<option value="+1" className="">
					+1
				</option>
				<option value="+44">+44</option>
				<option value="+91">+91</option>
			</select>

			<Input
				className=" focus-visible:ring-transparent  bg-transparent border-none text-black"
				placeholder="Mobile No."
			></Input>
		</div>
	);
};

export default PhoneInput;
