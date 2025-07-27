"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import SearchBar from "./Searchbar";
import LocationSelector from "./Location";
import { Button } from "@/components/ui";
import Typography from "@/components/Typography";
import {
	Album,
	Calendar,
	LayoutDashboard,
	LogOut,
	Menu,
	MessageCircle,
	PanelsLeftBottom,
	UserIcon,
	Search,
} from "lucide-react";
import { useOnClickOutside } from "@/hooks";
import { useRouter } from "next/navigation";
import routes from "@/constants/route.contant";
import { signOut, useSession } from "next-auth/react";
import { Explore } from "./Explore/Explore";
import { isAdminEmail } from "@/utils/helper";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const buyerRoutes = [
	{ href: "/buyer/profile", label: "My Profile", icon: <UserIcon className="w-4 h-4" /> },
	{ href: "/buyer/messages", label: "Inbox", icon: <MessageCircle className="w-4 h-4" /> },
	{ href: "/buyer/bookings", label: "My Bookings", icon: <Calendar className="w-4 h-4" /> },
	{ href: "/buyer/saved", label: "Bookmarked", icon: <Album className="w-4 h-4" /> },
];

const vendorRoutes = [
	{ href: "/vendor/dashboard", label: "Host Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
	{ href: "/buyer/vendor-messages", label: "Customer Messages", icon: <MessageCircle className="w-4 h-4" /> },
	{ href: "/buyer/bookings", label: "My Bookings", icon: <Calendar className="w-4 h-4" /> },
	{ href: "/buyer/saved", label: "Bookmarked", icon: <Album className="w-4 h-4" /> },
];

const Navbar = ({ scroll = true }: { scroll?: boolean }) => {
	const { data: session } = useSession();
	const user = session?.user;
	const [prevScrollPos, setPrevScrollPos] = useState(0);
	const [visible, setVisible] = useState(true);
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchExpanded, setSearchExpanded] = useState(false);
	const menuRef = useRef<any>(null);
	const searchRef = useRef<any>(null);
	const router = useRouter();
	const [hambOpen, sethambOpen] = useState(false);

	const handleLogout = async () => {
		await signOut();
		router.push("/login");
	};

	useOnClickOutside(menuRef, () => setMenuOpen(false));
	useOnClickOutside(searchRef, () => setSearchExpanded(false));

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollPos = window.scrollY;
			setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);

			setPrevScrollPos(currentScrollPos);
		};

		window.addEventListener("scroll", handleScroll);

		return () => window.removeEventListener("scroll", handleScroll);
	}, [prevScrollPos]);

	return (
		<nav
			className={`
       bg-murbBg
        flex 
		w-full
		lg:gap-12
		md:gap-8
		sm:gap-4
		gap-2
        items-center 
        text-white 
        rounded-b-3xl 
		md:px-14
		sm:px-10
        py-3
		px-4
        fixed 
        top-0 
        left-0 
        right-0 
        transition-transform 
        duration-300 z-50
        ${visible ? "translate-y-0" : !scroll ? "translate-y-0" : "-translate-y-full"}
      `}
		>
			<div className="flex-1 flex items-center relative justify-start md:justify-center gap-4 md:gap-8">
				<Link href="/" className="text-decoration-none flex items-center">
					<div className="w-12 h-12 md:w-20 md:h-20 relative">
						<Image
							src="/brand/brand-logo.svg"
							alt="logo"
							fill
							className="cursor-pointer object-contain"
							quality={100}
							style={{ filter: "brightness(1.1) contrast(1.2)" }}
						/>
					</div>
				</Link>

				{/* Desktop: Explore + SearchBar */}
				<div className="hidden md:flex md:flex-1 md:items-center md:gap-8">
					<div className="hidden md:block">
						<Explore showText={true} />
					</div>
					<SearchBar />
				</div>

				{/* Mobile: Explore always visible */}
				<div className="md:hidden">
					<Explore showText={!searchExpanded} />
				</div>
			</div>

			<div className="flex items-center justify-between md:gap-6">
				{isAdminEmail(user?.email || "") && (
					<Link
						href={"/admin/dashboard"}
						className="hidden md:inline-flex text-lg cursor-pointer decoration-white underline underline-offset-4"
					>
						Admin
					</Link>
				)}
				<div className="lg:block hidden">
					<LocationSelector />
				</div>
				{user ? (
					<div
						className="hidden relative md:flex items-center sm:gap-2 gap-4 cursor-pointer"
						onClick={() => setMenuOpen(!menuOpen)}
					>
						{user?.avatarUrl ? (
							<Image
								src={user?.avatarUrl || "/default-avatar.png"}
								alt={user?.email || "User"}
								width={32}
								height={32}
								className="rounded-full object-cover aspect-square"
							/>
						) : (
							<UserIcon className="w-6 h-6" />
						)}
						<Typography weight="medium" className="hidden md:inline-flex text-lg cursor-pointer">
							{user?.email?.split("@")[0] || "User"}
						</Typography>
						{menuOpen && (
							<div
								ref={menuRef}
								className="absolute right-0 top-12 mt-2 w-[200px] bg-white rounded-md shadow-lg z-50"
							>
								{(user.role === "BUYER" ? buyerRoutes : vendorRoutes).map((route, index) => (
									<Link
										key={index}
										href={route.href}
										className="block px-4 py-2 text-black rounded-md hover:bg-gray-100"
									>
										{route.label}
									</Link>
								))}
								<button
									onClick={handleLogout}
									className="w-full text-left block px-4 py-2 rounded-md text-black hover:bg-gray-100"
								>
									Logout
								</button>
							</div>
						)}
					</div>
				) : (
					<div className="hidden md:flex items-center sm:gap-1 md:gap-4">
						<Link href={routes.LOGIN}>
							<Button
								className="hover:bg-white/20 hover:text-white text-[16px] rounded-[24px] bg-transparent text-white"
								variant="ghost"
							>
								Login / Sign Up
							</Button>
						</Link>
						<Link href="/signup?role=VENDOR">
							<Button
								size="lg"
								className="border-white border-solid-[2px] hover:bg-white/20 hover:text-white text-[16px] rounded-[24px] bg-transparent text-white"
								variant="outline"
							>
								Become a Host
							</Button>
						</Link>
					</div>
				)}
			</div>
			{/* Mobile: Collapsible SearchBar */}
			<div ref={searchRef} className="md:hidden flex items-center relative">
				{searchExpanded ? (
					<div className="max-w-xs bg-primary-500 py-2 px-2 rounded-lg">
						<SearchBar />
					</div>
				) : (
					<Button variant="ghost" size="icon" onClick={() => setSearchExpanded(true)}>
						<Search className="!h-6 !w-6" />
					</Button>
				)}
			</div>
			<Sheet open={hambOpen} onOpenChange={sethambOpen}>
				<SheetTrigger asChild className="md:hidden">
					<Menu className="!h-7 !w-7" />
				</SheetTrigger>
				<SheetContent className="flex flex-col">
					Murb
					{user ? (
						<div className="grid gap-4">
							<section className="flex gap-2">
								{user?.avatarUrl ? (
									<Image
										src={user?.avatarUrl || "/default-avatar.png"}
										alt={user?.email || "User"}
										width={32}
										height={32}
										className="rounded-full"
									/>
								) : (
									<UserIcon className="w-6 h-6" />
								)}
								<Typography weight="medium" className="text-lg cursor-pointer">
									{user?.email?.split("@")[0] || "User"}
								</Typography>
							</section>

							<Button
								size="lg"
								className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:scale-105 duration-200 transition-all text-base rounded-[24px] bg-transparent"
								variant="outline"
							>
								<Explore onOpenHamburg={sethambOpen} showText={true} />
							</Button>
							<Button
								size="lg"
								className="border-[#FEFAF6] flex justify-center gap-2 w-full text-black border-solid-[2px] hover:scale-105 duration-200 transition-all text-base rounded-[24px] bg-transparent"
								variant="outline"
							>
								<LocationSelector onOpenHamburg={sethambOpen} />
							</Button>
							{isAdminEmail(user?.email || "") && (
								<Link href={"/admin/dashboard"} onClick={() => sethambOpen(false)}>
									<Button
										size="lg"
										className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:scale-105 duration-200 transition-all text-base rounded-[24px] bg-transparent"
										variant="outline"
									>
										<PanelsLeftBottom className="w-4 h-4" /> Admin Dashboard
									</Button>
								</Link>
							)}

							{(user.role === "BUYER" ? buyerRoutes : vendorRoutes).map((rou, idx) => (
								<Link href={rou.href} key={idx}>
									<Button
										size="lg"
										className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:scale-105 duration-300 transition-all text-base rounded-[24px] bg-transparent"
										variant="outline"
										onClick={() => sethambOpen(false)}
									>
										{rou.icon} {rou.label}
									</Button>
								</Link>
							))}
							<Button
								size="lg"
								onClick={handleLogout}
								className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:scale-105 duration-200 transition-all text-base rounded-[24px] bg-transparent"
								variant="outline"
							>
								<LogOut className="w-4 h-4" /> Logout
							</Button>
						</div>
					) : (
						<>
							<Button
								size="lg"
								className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:scale-105 duration-200 transition-all text-base rounded-[24px] bg-transparent"
								variant="outline"
							>
								<Explore onOpenHamburg={sethambOpen} showText={true} />
							</Button>
							<Button
								size="lg"
								className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:scale-105 duration-200 transition-all text-base rounded-[24px] bg-transparent"
								variant="outline"
							>
								<LocationSelector onOpenHamburg={sethambOpen} />
							</Button>
							<Link href={routes.LOGIN}>
								<Button
									size="lg"
									className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:bg-white/20 hover:scale-105 duration-300 transition-all text-base rounded-[24px] bg-transparent"
									variant="outline"
									onClick={() => sethambOpen(false)}
								>
									Login
								</Button>
							</Link>
							<Link href={routes.CREATEACCOUNT}>
								<Button
									size="lg"
									className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:bg-white/20 hover:scale-105 duration-300 transition-all text-base rounded-[24px] bg-transparent"
									variant="outline"
									onClick={() => sethambOpen(false)}
								>
									Sign Up
								</Button>
							</Link>
							<Link href="/signup?role=VENDOR">
								<Button
									size="lg"
									className="border-[#FEFAF6] w-full text-black border-solid-[2px] hover:bg-white/20 hover:scale-105 duration-300 transition-all text-base rounded-[24px] bg-transparent"
									variant="outline"
									onClick={() => sethambOpen(false)}
								>
									Become a Host
								</Button>
							</Link>
						</>
					)}
				</SheetContent>
			</Sheet>
		</nav>
	);
};

export default Navbar;
