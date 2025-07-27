"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { isAdminEmail } from "@/utils/helper";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui";

interface INavbarProps {
	title?: string;
}

const AdminNavbar = ({ title }: INavbarProps) => {
	const { data: session } = useSession();
	const userData = session?.user;
	return (
		<nav className="bg-white h-[84px] w-full flex items-center justify-between px-6 border-b z-10 fixed">
			<div className="flex items-center">
				<Link href="/admin/dashboard">
					<Image src="/brand/brand-logo-black.svg" height={60} width={60} alt="Logo" className="w-15 h-15" />
				</Link>
				<span className="md:ml-10 text-lg font-medium text-[#4D4D4D] font-gilroy capitalize">
					{"Welcome " + (userData?.firstName ? userData?.firstName : "Admin")}
				</span>
			</div>
			{userData ? (
				<div className="flex items-center space-x-4">
					{isAdminEmail(userData?.email || "") &&
						(userData.role === "VENDOR" ? (
							<Link
								href={"/vendor/dashboard"}
								className="hidden md:inline-flex text-[16px] cursor-pointer decoration-gray-300 underline underline-offset-4"
							>
								Host Dashboard
							</Link>
						) : (
							<Link
								href={"/"}
								className="hidden md:inline-flex text-[16px] cursor-pointer decoration-gray-300 underline underline-offset-4"
							>
								Home
							</Link>
						))}
					{/* <div className="cursor-pointer p-2 rounded-[10px] w-10 h-10 bg-inherit flex items-center justify-center">
						<Bell className="h-6 w-5 text-gray-700" />
					</div> */}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-10 w-10 rounded-full">
								<Avatar className="h-10 w-10 shadow">
									<AvatarImage
										src={
											session.user.role === "BUYER"
												? session?.user?.avatarUrl
												: session?.user?.vendor?.govermentPhotoIdUrls[2] || "/avatars/01.png"
										}
										alt="@shadcn"
									/>
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
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<Link href="/">
									<DropdownMenuItem className="cursor-pointer text-base">Home</DropdownMenuItem>
								</Link>

								{userData.role === "VENDOR" && (
									<Link href="/vendor/dashboard">
										<DropdownMenuItem className="cursor-pointer text-base">
											Host Dashboard
										</DropdownMenuItem>
									</Link>
								)}
								{isAdminEmail(session?.user?.email || "") && (
									<Link href="/admin/dashboard">
										<DropdownMenuItem className="cursor-pointer text-base">
											Admin Dashboard
										</DropdownMenuItem>
									</Link>
								)}
							</DropdownMenuGroup>
							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={async () => await signOut()}
								className="cursor-pointer text-base"
							>
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<div className="flex items-center space-x-4">
					<Link href={"/login"}>Login</Link>
					<Link href={"/signup"}>Sign up</Link>
				</div>
			)}
		</nav>
	);
};

export default AdminNavbar;
