"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAdminEmail } from "@/utils/helper";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function VendorNav() {
	const { data: session } = useSession();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-10 w-10 rounded-full">
					<Avatar className="h-10 w-10 shadow">
						<AvatarImage src={session?.user?.avatarUrl} className="object-cover" alt="@shadcn" />
						<AvatarFallback>
							{session?.user?.name?.charAt(0).toUpperCase() ||
								session?.user?.email?.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56 text-lg" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{session?.user?.name}</p>
						<p className="text-sm leading-none text-muted-foreground">{session?.user?.email}</p>
					</div>
					{session?.user?.accountStatus && (
						<div
							className={`text-[#6F6F6F] font-md  text-sm py-2 flex gap-1.5 items-center  ${session?.user?.accountStatus === "VERIFIED" ? "text-[#e09443]" : session?.user?.accountStatus === "UNVERIFIED" ? "text-[#6F6F6F]" : "text-[#34A853]"}`}
						>
							<div
								className={`h-1.5 w-1.5 rounded-full ${session?.user?.accountStatus === "VERIFIED" ? "bg-[#34A853]" : session?.user?.accountStatus === "UNVERIFIED" ? "bg-[#6F6F6F]" : "bg-[#e09443]"}`}
							></div>
							{session?.user?.accountStatus
								? session?.user?.accountStatus.charAt(0).toUpperCase() +
									session?.user?.accountStatus.slice(1).toLowerCase()
								: ""}
						</div>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link href="/">
						<DropdownMenuItem className="cursor-pointer text-base">Home</DropdownMenuItem>
					</Link>
					<Link href="/vendor/dashboard">
						<DropdownMenuItem className="cursor-pointer text-base">Host Dashboard</DropdownMenuItem>
					</Link>
					{isAdminEmail(session?.user?.email || "") && (
						<Link href="/admin/dashboard">
							<DropdownMenuItem className="cursor-pointer text-base">Admin Dashboard</DropdownMenuItem>
						</Link>
					)}

					<Link href="/vendor/saved">
						<DropdownMenuItem className="cursor-pointer text-base">Bookmarked</DropdownMenuItem>
					</Link>

					<Link href="/vendor/profile">
						<DropdownMenuItem className="cursor-pointer text-base">Profile</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />

				<DropdownMenuItem onClick={async () => await signOut()} className="cursor-pointer text-base">
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
