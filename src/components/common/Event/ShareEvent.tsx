import { Copy, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function ShareEvent({ eventId }: { eventId: string }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full rounded-lg">
					Share
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share link</DialogTitle>
					<DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
				</DialogHeader>
				<div className="flex items-center space-x-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="link" className="sr-only">
							Link
						</Label>
						<Input
							id="link"
							defaultValue={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}`}
							readOnly
						/>
					</div>

					<Button
						size="sm"
						className="px-3"
						variant="outline"
						onClick={() => {
							navigator.clipboard.writeText(
								`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}`,
							);
							toast.success("Link copied to clipboard");
						}}
					>
						<span className="sr-only">Copy</span>
						<Copy className="w-4 h-4" />
					</Button>
				</div>

				<div className="flex flex-col gap-4 mt-4">
					<DialogDescription>Share on social media</DialogDescription>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => {
								const url = `https://wa.me/?text=${encodeURIComponent(
									`Check out this event: ${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}`,
								)}`;
								window.open(url, "_blank");
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								className="mr-2"
								viewBox="0 0 16 16"
							>
								<path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
							</svg>
							{/* WhatsApp */}
						</Button>

						<Button
							variant="outline"
							onClick={() => {
								const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
									`Check out this event: ${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}`,
								)}`;
								window.open(url, "_blank");
							}}
						>
							<Twitter />
						</Button>

						<HoverCard>
							<HoverCardTrigger asChild>
								<Button
									variant="outline"
									onClick={() => {
										const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
											`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}`,
										)}`;
										window.open(url, "_blank");
									}}
								>
									<Facebook />
								</Button>
							</HoverCardTrigger>
							<HoverCardContent>
								<p>Share on Facebook</p>
							</HoverCardContent>
						</HoverCard>
						<HoverCard>
							<HoverCardTrigger asChild>
								<Button
									variant="outline"
									onClick={() => {
										const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
											`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/event/detail/${eventId}`,
										)}&title=${encodeURIComponent("Check out this event!")}&summary=${encodeURIComponent(
											"I found an interesting event you might want to check out.",
										)}`;
										window.open(url, "_blank");
									}}
								>
									<Linkedin />
								</Button>
							</HoverCardTrigger>
							<HoverCardContent>
								<p>Share on LinkedIn</p>
							</HoverCardContent>
						</HoverCard>
					</div>
				</div>
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
