import LottieSpinner from "@/components/Loader";
import { useOnClickOutside } from "@/hooks";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import Image from "next/image";
import { CrossIcon, X } from "lucide-react";
import { DialogContent } from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";

interface ICreateAccount {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	open: boolean;
}

export default function CreateAccount({ setOpen, open }: ICreateAccount) {
	const router = useRouter();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Open</Button>
			</DialogTrigger>
			<DialogContent className="w-full max-w-[400px] space-y-4">
				<div className="text-center flex items-center justify-center" aria-hidden="true">
					<Image src="/brand/brand-logo-black.svg" alt="loader" width={100} height={100} />
				</div>
				<h2 className="text-xl font-medium text-center text-gray-800">
					Please Login or Create an Account before publishing the Event
				</h2>
				<div className="text-center text-sm text-gray-800">
					<p>Don&apos;t worry! Your event details have been saved.</p>
					<p>When you log back in, you can continue from where you left off.</p>
				</div>
				<div className="flex items-center justify-center gap-4">
					<Button
						onClick={() => {
							router.push("/login?role=VENDOR&redirect=/event/create?isPublish=true");
						}}
					>
						Login
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							router.push("/signup?role=VENDOR&redirect=/event/create?isPublish=true");
						}}
					>
						Create Account
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
