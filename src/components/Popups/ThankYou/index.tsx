import { useOnClickOutside } from "@/hooks";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface ICreateAccount {
	handleCLose: (_: boolean) => void;
	inprogress?: boolean;
}

export default function ThankYou({ handleCLose, inprogress = false }: ICreateAccount) {
	const publishRef = useRef<any>(null);
	useOnClickOutside(publishRef, () => {
		handleCLose(false);
	});

	const router = useRouter();

	return (
		<div className="flex p-0 flex-col fixed h-screen bottom-0 w-full shadow-md items-center justify-center bg-black bg-opacity-70 z-40 ">
			<div
				className="w-full p-[56px] max-w-[600px] flex flex-col items-center justify-center bg-white rounded-lg shadow-md  space-y-6 z-40"
				ref={publishRef}
			>
				<div className="flex flex-col items-center gap-7 justify-center text-center">
					<Image src={"/images/logo-murb.svg"} alt="logo" width={96} height={96} />
					<h1 className="text-black text-[32px] font-medium leading-[120%]">
						Thank You <br /> for your Details
					</h1>
				</div>
				{inprogress ? (
					<h2 className="text-[20px] font-normal text-center text-gray-800">
						Your account verification is in progress till then please wait, your event will be live once
						your account details will be verified by our team. We will get back to you soon.
						<br /> <br /> Incase of any query , please write to <br />
						info@murb.com
					</h2>
				) : (
					<h2 className="text-[20px] font-normal text-center text-gray-800">
						We have received your application for the event listing, your event will be live once your
						account details will be verified by our team. We will get back to you soon.
						<br /> <br /> Incase of any query , please write to <br />
						info@murb.com
					</h2>
				)}

				<Button
					className="w-fit text-[16px] font-medium px-8 py-6 bg-black text-white hover:bg-gray-800 hover:scale-105 transition-all ease duration-300"
					onClick={() => {
						router.push("/dashboard");
					}}
				>
					Dashboard
				</Button>
			</div>
		</div>
	);
}
