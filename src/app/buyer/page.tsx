"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import Typography from "@/components/Typography";
import { useRouter } from "next/navigation";

export default function LandingPage() {
	const carouselImages = [
		"/images/events-1.svg",
		"/images/events-1.svg",
		"/images/events-1.svg",
		"/images/events-1.svg",
		"/images/events-1.svg",
	];
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const router = useRouter();

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
	};

	return (
		<div className="h-screen bg-white text-black w-full">
			<header className="bg-black text-white rounded-b-3xl pl-[100px] pr-[55px] py-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between ">
					<div className="flex items-center">
						<div className="h-11 w-11 rounded-full bg-[#C4C6CB]" />
						<div className="h-11 w-11 rounded-full bg-[#F4F4F6] -ml-6" />
						<div className="h-11 w-11 rounded-full bg-[#DAC0A3] -ml-6" />
					</div>
					<nav className="hidden md:flex items-center space-x-6 text-[#FEFAF6]">
						<Link href="#" className=" font-medium text-[16px]">
							Products
						</Link>
						<Link href="#" className=" font-medium text-[16px]">
							Pricing
						</Link>
						<Link href="#" className=" font-medium text-[16px]">
							Community
						</Link>
					</nav>
					<div className="flex items-center space-x-8">
						<Typography
							weight="medium"
							className="hidden md:inline-flex text-[#DAC0A3] text-[16px] hover:none cursor-pointer"
						>
							<MapPin className="h-6 w-6 mr-2" />
							Pune
						</Typography>
						<Typography
							weight="medium"
							className="hidden md:inline-flex text-[16px] hover:none cursor-pointer"
							onClick={() => {
								router.push("event/create");
							}}
						>
							List Event
						</Typography>
						<Typography
							weight="medium"
							className="hidden md:inline-flex text-[16px] hover:none cursor-pointer"
						>
							Login
						</Typography>
						<Button
							size="lg"
							className="border-[#FEFAF6] border-solid-[2px] hover:bg-transparent hover:text-white text-[16px] rounded-[24px] bg-transparent text-white"
							variant="outline"
						>
							Sign Up
						</Button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-center mb-8">
					Experience Life Like Never Before
				</h1>
				<div className="relative mb-8 overflow-hidden">
					<div
						className="flex transition-transform duration-300 ease-in-out"
						style={{
							transform: `translateX(-${currentIndex * 100}%)`,
						}}
					>
						{carouselImages.map((src, index) => (
							<div key={index} className="flex-shrink-0 w-full flex justify-center items-center">
								<div className="relative w-full max-w-4xl flex justify-center items-center">
									<Image
										src={
											carouselImages[(index - 1 + carouselImages.length) % carouselImages.length]
										}
										alt={"Previous image"}
										width={564}
										height={283}
										className="absolute left-0 transform -translate-x-1/2 scale-75 opacity-50 rounded-lg object-cover"
									/>
									<Image
										src={src}
										alt={`Carousel image ${index + 1}`}
										width={714}
										height={358}
										className="rounded-lg object-cover z-10"
									/>
									<Image
										src={carouselImages[(index + 1) % carouselImages.length]}
										alt={"Next image"}
										width={564}
										height={283}
										className="absolute right-0 transform translate-x-1/2 scale-75 opacity-50 rounded-lg object-cover"
									/>
								</div>
							</div>
						))}
					</div>
					<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
						{carouselImages.map((_, index) => (
							<div
								key={index}
								className={`h-2 w-2 rounded-full ${
									index === currentIndex ? "bg-black" : "bg-gray-300"
								}`}
							/>
						))}
					</div>
					<button
						onClick={prevSlide}
						className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 text-white rounded-full p-2 z-20"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</button>
					<button
						onClick={nextSlide}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 text-white rounded-full p-2 z-20"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</button>
				</div>
				<div className="relative max-w-2xl mx-auto">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<Input
						type="text"
						placeholder="Search for Location, Artist, Sports, Events etc..."
						className="pl-10 pr-4 py-2 w-full bg-gray-100 border border-gray-300 rounded-full text-black placeholder-gray-400"
					/>
					<Button
						size="sm"
						className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black text-white hover:bg-gray-800"
					>
						Search
					</Button>
				</div>
			</main>
		</div>
	);
}
