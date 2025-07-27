"use client";
import React from "react";
import {
	Home,
	Calendar,
	MessageSquare,
	Users,
	Megaphone,
	Star,
	LogOut,
	SquareChartGantt,
	Headset,
	Menu,
	ChartNoAxesCombined,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Sidebar = () => {
	const [open, setOpen] = useState(false);
	const [hambOpen, setHambOpen] = useState(false);
	const sidebarItems = [
		{ icon: Home, label: "Home", link: "/vendor/dashboard" },
		{ icon: Calendar, label: "Listings", link: "/vendor/dashboard/events" },
		{
			icon: MessageSquare,
			label: "Message",
			link: "/vendor/dashboard/messages",
		},
		{ icon: Users, label: "Buyers List", link: "/vendor/dashboard/buyer" },
		{
			icon: Calendar,
			label: "Calendar",
			link: "/vendor/dashboard/calendar",
		},
		{
			icon: ChartNoAxesCombined,
			label: "Revenue",
			link: "/vendor/dashboard/revenue",
		},
		{
			icon: Megaphone,
			label: "Promotions",
			link: "/vendor/dashboard/promotions",
		},
		{
			icon: Headset,
			label: "Add-on Services",
			link: "/vendor/dashboard/addon",
		},
		{
			icon: SquareChartGantt,
			label: "Articles",
			link: "/vendor/dashboard/articles",
		},
		{
			icon: Star,
			label: "Reviews & Ratings",
			link: "/vendor/dashboard/feedbacks",
		},
	];
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = async () => {
		try {
			await signOut();
			router.push("/login");
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<>
			<aside className=" bg-[#FBF5ED] hidden pt-3 px-4 md:flex flex-col items-center overflow-y-auto">
				{sidebarItems.map((item, index) => (
					<Link
						key={index}
						href={item.link}
						className={`flex flex-col items-center justify-center rounded-[10px] w-full py-2 px-2 my-0.5 ${
							pathname === item.link ? "bg-[#CFAD87] text-white" : "text-gray-600"
						} hover:bg-[#CFAD87]`}
					>
						<item.icon className="w-6 h-6 mb-1" />
						<span className="text-xs text-center whitespace-nowrap">{item.label}</span>
					</Link>
				))}
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<div className="mt-auto flex flex-col items-center justify-center w-full py-4 text-gray-600 hover:bg-[#FDF8F3] cursor-pointer hover:scale-105 transition-all ease duration-400">
							<LogOut className="w-6 h-6 mb-1" />
							<span className="text-xs">Log Out</span>
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-48 " side="right">
						<div className="flex flex-col gap-2 p-1">
							<p className="text-sm font-normal text-[#666666]">Are you sure you want to logout?</p>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									size="sm"
									className="px-3 py-1 "
									onClick={() => setOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									size="sm"
									className="px-3 py-1 bg-[#C3996B] hover:bg-[#EDE0D1]"
									onClick={() => {
										setOpen(false);
										handleLogout();
									}}
								>
									Logout
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</aside>
			<Sheet open={hambOpen} onOpenChange={setHambOpen}>
				<SheetTrigger className="md:hidden absolute top-20 z-10 left-0" asChild>
					<Button variant="outline" className="shadow-md">
						<Menu />
					</Button>
				</SheetTrigger>
				<SheetContent side={"left"} className="w-fit">
					<SheetHeader className="mb-2">
						<SheetTitle>Murb</SheetTitle>
						{/* <SheetDescription>
							This action cannot be undone. This will permanently delete your account and remove your data
							from our servers.
						</SheetDescription> */}
					</SheetHeader>
					{sidebarItems.map((item, index) => (
						<Link
							key={index}
							href={item.link}
							className={`flex flex-col items-center justify-center rounded-[10px] w-full py-2 px-2 my-0.5 ${
								pathname === item.link ? "bg-[#CFAD87] text-white" : "text-gray-600"
							} hover:bg-[#CFAD87]`}
							onClick={() => setHambOpen(false)}
						>
							<item.icon className="w-6 h-6 mb-1" />
							<span className="text-xs text-center whitespace-nowrap">{item.label}</span>
						</Link>
					))}
					<hr className="my-4" />
					<div
						onClick={() => {
							setOpen(false);
							handleLogout();
						}}
						className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] w-full py-2 px-2 my-0.5  hover:bg-[#CFAD87] hover:text-white`}
					>
						<LogOut className="w-6 h-6" />
						<span className="text-xs">Log Out</span>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default Sidebar;
