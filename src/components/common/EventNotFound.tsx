import Image from "next/image";
import React from "react";

export default function EventNotFound() {
	return (
		<div className="w-full grid place-content-center">
			<div className="relative w-72 opacity-40 h-72">
				<Image fill src={"/not-found-img.jpg"} alt="Not found image" />
			</div>
		</div>
	);
}
