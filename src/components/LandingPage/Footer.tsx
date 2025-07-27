"use client";
import React from "react";
import { FaInstagramSquare } from "react-icons/fa";
import { FaSquarePhone, FaSquareWhatsapp } from "react-icons/fa6";

import { FaSquareXTwitter } from "react-icons/fa6";
import { SiLinkedin } from "react-icons/si";
// import { FaSquareYoutube } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { eventTypes } from "@/constants/event.constant";
import { IoMdMail } from "react-icons/io";
import { useSession } from "next-auth/react";
import { PiMapPinLineFill } from "react-icons/pi";

const Footer = () => {
	const { data: session } = useSession();

	return (
		<footer className="w-full bg-[#C3996B] text-white px-8 md:px-20 py-8 md:py-12 h-full">
			<div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8">
				{/* Logo and Social Media Section */}
				<div className="space-y-6">
					<div className="flex items-center gap-2">
						<Image src="/brand/brand-logo.svg" alt="Murb Logo" width={82} height={82} />
					</div>
					<div className="flex flex-col gap-3 justify-center">
						{/* <h3 className="font-semibold text-[16px]">SOCIAL MEDIA</h3> */}
						<p className="text-base">Follow us on social media to find out the latest updates.</p>
						<div className="flex gap-3 items-center">
							<Link
								target="_blank"
								href="https://www.instagram.com/murb_in/"
								className="hover:text-gray-200"
							>
								<FaInstagramSquare className="w-7 h-7" />
							</Link>
							<Link target="_blank" href="https://x.com/Murbevents" className="hover:text-gray-200">
								<FaSquareXTwitter className="w-7 h-7" />
							</Link>
							<Link
								target="_blank"
								href="https://www.linkedin.com/company/murb-co-in/?viewAsMember=true"
								className="hover:text-gray-200"
							>
								<SiLinkedin className="w-6 h-6" />
							</Link>
							<Link
								target="_blank"
								href="https://chat.whatsapp.com/E5Lqgk9gr5P33zddD9JTKG "
								className="hover:text-gray-200"
							>
								<FaSquareWhatsapp className="w-7 h-7" />
							</Link>
							{/* <Link target="_blank" href="#" className="hover:text-gray-200">
									<FaSquareYoutube className="w-7 h-7" />
								</Link> */}
						</div>
					</div>
				</div>

				{/* Explore Section */}
				<div className="space-y-4 w-full">
					<h3 className="text-xl font-semibold">Explore</h3>
					<ul className="space-y-2 w-full">
						<li>
							<Link href="/#venue" className="hover:text-gray-200 ">
								Venue
							</Link>
						</li>
						{eventTypes.slice(1).map((str, idx) => (
							<li key={idx}>
								<Link href={`/?type=${str}&event=eventType#eventType`} className="hover:text-gray-200 ">
									{str}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* Resources Section */}
				<div className="space-y-4">
					<h3 className="text-xl font-semibold">Resources</h3>
					<ul className="space-y-2">
						<li>
							<Link href="/about-us" className="hover:text-gray-200">
								About Us
							</Link>
						</li>
						{session?.user && session.user.role !== "BUYER" ? null : (
							<li>
								<Link href="/#JOIN-THE-COMMUNITY" className="hover:text-gray-200">
									Join as a Host
								</Link>
							</li>
						)}
						<li>
							<Link href="/#FAQ" className="hover:text-gray-200">
								FAQs
							</Link>
						</li>
						<li>
							<a href="/articles" className="hover:text-gray-200">
								Articles
							</a>
						</li>
					</ul>
				</div>

				<div className="flex flex-col gap-3">
					<p className="text-xl font-semibold">Contact Us</p>
					<div className="flex gap-3 flex-col">
						<Link href="mailto:communication@murb.in" className="hover:text-gray-200 flex gap-2 items-center">
							<IoMdMail className="w-6 h-6" /> communication@murb.in
						</Link>
						<Link href="tel:+919163118752" className="hover:text-gray-200 flex gap-2 items-center">
							<FaSquarePhone className="w-6 h-6" /> +91 91631-18752
						</Link>

						<div className="hover:text-gray-200 flex gap-2 items-center">
							<PiMapPinLineFill className="w-6 h-6" /> A/74 Lake Gardens Kolkata - 700045
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Section */}
			<div className="mt-12 pt-8 border-t border-white/20 w-full">
				<div className="flex flex-col md:flex-row justify-center items-center gap-10 md:space-y-0">
					<div className="flex space-x-6 text-sm">
						<Link href="/terms-of-service" className="hover:text-gray-200 underline">
							Terms of Service
						</Link>
						<Link href="/privacy-policy" className="hover:text-gray-200 underline">
							Privacy Policy
						</Link>
					</div>
					<div className="text-sm">Murb Inc. 2025 All Rights Reserved ©2025</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
