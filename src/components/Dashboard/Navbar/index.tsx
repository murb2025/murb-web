"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import { isAdminEmail } from "@/utils/helper";
import { VendorNav } from "./VendorNav";
import VendorNotification from "./VendorNotification";

const Navbar = () => {
	const { data: session } = useSession();
	const userData = session?.user;

	return (
		<nav className="bg-white h-[84px] w-full flex items-center justify-between px-6 border-b z-10 fixed top-0">
			<div className="flex items-center">
				<Link href={userData?.role === "VENDOR" ? "/vendor/dashboard" : "/"}>
					<Image src="/brand/brand-logo-black.svg" height={60} width={60} alt="Logo" className="w-15 h-15" />
				</Link>
				<div className="ml-4 md:ml-10 text-base md:text-lg font-medium text-[#4D4D4D] font-gilroy capitalize">
					Welcome
					{userData?.firstName ? " " + userData?.firstName : " Host"}
				</div>
			</div>
			{userData ? (
				<div className="flex items-center gap-2 md:space-x-4">
					{isAdminEmail(userData?.email || "") && (
						<Link
							href={"/admin/dashboard"}
							className="hidden md:inline-flex text-[16px] cursor-pointer decoration-gray-300 underline underline-offset-4"
						>
							Admin
						</Link>
					)}
					{/* <span className="text-lg">Welcome, Siddharth</span> */}
					{userData?.accountStatus && (
						<div
							className={`md:flex md:mr-4 font-medium text-sm md:text-base px-3 py-1.5 rounded-full flex gap-2 items-center ${
								userData?.accountStatus === "VERIFIED"
									? "bg-emerald-100 text-emerald-700"
									: userData?.accountStatus === "UNVERIFIED"
										? "bg-gray-100 text-gray-600"
										: "bg-amber-100 text-amber-700"
							}`}
						>
							<div
								className={`h-2 w-2 rounded-full ${
									userData?.accountStatus === "VERIFIED"
										? "bg-emerald-500"
										: userData?.accountStatus === "UNVERIFIED"
											? "bg-gray-500"
											: "bg-amber-500"
								}`}
							></div>
							{userData?.accountStatus
								? userData.accountStatus.charAt(0).toUpperCase() +
									userData.accountStatus.slice(1).toLowerCase()
								: ""}
						</div>
					)}
					<VendorNotification />
					<VendorNav />
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

export default Navbar;
