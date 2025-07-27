import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function EventCardLoader({ type }: { type?: "BUYER" | "VENDOR" | "ADMIN" | "LISTING" }) {
	return (
		<>
			<div className="bg-white flex-1 w-[calc(100%-1rem)] min-[400px]:w-[350px] rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-[#AEAEAE]/56 cursor-pointer">
				<div className="relative">
					<Skeleton className="h-[194px] rounded-se-none w-full rounded-xl" />
				</div>
				<div className="p-5 px-7">
					<div className="flex justify-between gap-4 items-center mb-2">
						<Skeleton className="h-6 w-3/4" />

						<Skeleton className="h-6 w-1/4" />
					</div>
					<div className="space-y-2 text-gray-600 mb-2">
						<div className="flex items-center gap-3">
							<Calendar className="animate-pulse w-5 h-5 text-[#CE8330]" />
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="flex items-center gap-3">
							<Clock className="animate-pulse w-5 h-5 text-[#CE8330]" />
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="flex items-center gap-3">
							<MapPin className="animate-pulse w-5 h-5 text-[#CE8330]" />
							<Skeleton className="h-4 w-full" />
						</div>
					</div>

					<div className="flex flex-col justify-between pt-2 border-t border-gray-100">
						{type !== "BUYER" ? (
							<div className="flex flex-row items-center justify-between">
								<Skeleton className="h-8 w-2/3" />
								<div className="flex items-center gap-2">
									<Users className="animate-pulse w-5 h-5 text-[#CE8330]" />
									<Skeleton className="h-5 w-5" />
								</div>
							</div>
						) : (
							<>
								<div className="flex items-center gap-2">
									<Users className="animate-pulse w-5 h-5 text-[#CE8330]" />
									<Skeleton className="h-4 w-1/3" />
								</div>
								<div className="flex mt-2 items-center justify-between">
									<Skeleton className="h-8 w-2/5" />
									<Skeleton className="h-8 w-1/3" />
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
