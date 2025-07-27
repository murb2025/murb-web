import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FAQ } from "@/components/LandingPage/FAQ";
import OfferCarousel from "@/components/LandingPage/Crousel/OfferCarousel";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaInstagramSquare, FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { CiLinkedin } from "react-icons/ci";
import { RiTwitterXFill } from "react-icons/ri";

export default function page() {
	return (
		<main className="min-h-screen w-full mx-auto">
			{/* About Us & Magic Devs Section */}
			<section className="relative h-[400px] md:h-[500px] lg:h-[95vh]">
				<div className="absolute inset-0">
					<Image
						src="/about/hero-img.jpeg"
						alt="Stadium filled with spectators"
						fill
						className="object-cover brightness-75 grayscale"
						priority
					/>
				</div>
				<div className="z-10 relative flex flex-col justify-center items-center md:items-start h-full px-8 md:px-28 text-white">
					<h1 className="text-[2rem] md:text-[3rem] font-semibold">Join the Movement</h1>
					<p className="text-xl md:text-2xl mb-4 text-center md:text-left">
						Let's move, play and grow together—
						<br className="hidden md:block" />
						one booking at a time.
					</p>
					<div>
						<Link href="/">
							<Button variant="custom" className="font-semibold md:px-10" size={"lg"}>
								Book Now
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 gap-8 px-4 py-16 md:grid-cols-2 md:px-16 lg:px-24">
				<div className="space-y-4 shadow rounded-lg p-4 px-8">
					<h2 className="text-2xl font-bold text-center">About Us</h2>
					<p className="text-lg leading-relaxed text-justify text-gray-900">
						Welcome to Murb, your ultimate destination for exploring and engaging with the world of sports
						and wellness. Murb is a digital platform designed to make sports accessible, enjoyable and part
						of everyone's lifestyle. We're here to connect you with the best sports venues, certified
						coaches, expert trainers, and workshops—all through a seamless and user-friendly platform.
					</p>
				</div>
				<div className="space-y-4 shadow rounded-lg p-8">
					<h2 className="text-2xl font-bold text-center">Our Mission</h2>
					<p className="text-lg leading-relaxed text-justify text-gray-900">
						To empower individuals to lead active, healthy lives by simplifying access to sports and
						wellness services. We aim to bridge the gap between enthusiasts and providers fostering a
						thriving sports culture in every community.
					</p>
				</div>
			</section>

			{/* What We Offer Section */}
			<section className="px-6 py-8 md:py-16 md:px-16 lg:px-24">
				<h2 className="mb-2 text-2xl font-bold text-center">What We Offer</h2>
				<p className="max-w-2xl mx-auto mb-12 md:mb-20 text-lg text-center text-gray-900">
					Whether you're a beginner trying something new or a seasoned athlete honing your skills, Murb is
					designed to cater to your needs.
				</p>

				<OfferCarousel
					offers={[
						{
							title: "Book Venues",
							description: "Reserve tennis courts, football turfs, swimming pools, and more.",
							image: "/about/offer-1.png",
						},
						{
							title: "Get Certified",
							description:
								"Enroll in professional certifications like open water diving or yoga instructor training.",
							image: "/about/offer-2.png",
						},
						{
							title: "Learn and Train",
							description:
								"Join workshops and training sessions for activities like horse riding, martial arts, and fitness.",
							image: "/about/offer-3.png",
						},
						{
							title: "Personalized Coaching",
							description:
								"Find yoga instructors, personal trainers, or group class instructors to guide you.",
							image: "/about/offer-4.png",
						},
					]}
				/>
			</section>

			<section className="px-6 py-10 md:py-16 bg-[#c2996a10] md:px-16 lg:px-24">
				<h2 className="mb-2 text-2xl font-bold text-center">Why Choose Murb?</h2>
				<p className="max-w-2xl text-lg mx-auto mb-12 text-center text-gray-900">
					Whether you're a beginner trying something new or a seasoned athlete honing your skills, Murb is
					designed to cater to your needs.
				</p>

				<div className="grid grid-cols-1 px-6 max-w-5xl mx-auto gap-4 md:mb-12 sm:grid-cols-2 lg:grid-cols-4">
					{[
						{
							title: "Comprehensive Platform",
							description: "One-stop solution for all your sports and wellness needs",
						},
						{
							title: "Trusted Hosts",
							description: "Partnering with top-rated venues and certified trainers",
						},
						{
							title: "Seamless Experience",
							description: "Easy booking process with secure payments",
						},
						{
							title: "Tailored Options",
							description: "Flexible choices for individuals, groups and corporates",
						},
					].map((item, idx) => (
						<div key={idx} className="p-4 py-6 bg-[#C2996A33] rounded-2xl space-y-4">
							<h3 className="mb-2 text-lg flex flex-col font-bold leading-tight text-center">
								{item.title.split(" ").map((word) => (
									<span key={word}>{word}</span>
								))}
							</h3>
							<div className="h-[1px] bg-white w-full"></div>
							<p className="text-lg text-center text-gray-900">{item.description}</p>
						</div>
					))}
				</div>
			</section>
			<section className="px-7 py-16 md:px-16 lg:px-24">
				<div className="space-y-8">
					<h2 className="text-2xl font-bold text-center">Our Story</h2>
					<p className="max-w-5xl mx-auto text-lg text-center text-gray-900">
						Founded by passionate entrepreneurs <strong>Bhavya Ranjan</strong> and{" "}
						<strong>Megha Gupta</strong>, Murb was born out of a desire to make sports and wellness
						accessible to everyone. Megha and Bhavya share a special vision of making high-end sports
						facilities and training programs accessible to enthusiasts across all demographics. They
						recognized that people now have the purchasing power to afford these premium experiences but
						often lack easy access to them. Murb simplifies these challenges by combining technology with a
						love for sports.
					</p>

					<div className="flex justify-center gap-8 pt-10">
						{[
							{
								name: "Bhavya Ranjan",
								image: "/about/bhavya.jpg",
								linkedin: "https://www.linkedin.com/in/bhavya-ranjan-00000000000000000000000000000000/",
								instagram: "https://www.instagram.com/murb_in/",
								twitter: "https://x.com/Murbevents",
							},
							{
								name: "Megha Gupta",
								image: "/about/megha.jpg",
								linkedin: "https://www.linkedin.com/in/megha-gupta-00000000000000000000000000000000/",
								instagram: "https://www.instagram.com/murb_in/",
								twitter: "https://x.com/Murbevents",
							},
						].map((person) => (
							<div
								key={person.name}
								className="relative w-64 overflow-hidden transition-all group cursor-pointer duration-300 grayscale hover:grayscale-0 bg-black rounded-2xl h-64 md:h-80"
							>
								<Image src={person.image} alt={person.name} fill className="object-cover" />
								{/* <div className="absolute inset-0 "></div> */}
								<div className="absolute bottom-0 transition-all duration-300 bg-gradient-to-t from-black  group-hover:via-black/90 via-black/60 to-transparent w-full p-4 text-white">
									{/* <div className="flex justify-center gap-2 mb-2">
										<Link
											target="_blank"
											href={person.instagram}
											className="hover:text-gray-200 bg-black/60 rounded-xl p-1"
										>
											<FaInstagram className="w-5 h-5" />
										</Link>
										<Link
											target="_blank"
											href={person.twitter}
											className="hover:text-gray-200  bg-black/60 rounded-xl p-1"
										>
											<RiTwitterXFill className="w-5 h-5" />
										</Link>
										<Link
											target="_blank"
											href={person.linkedin}
											className="hover:text-gray-200  bg-black/60 rounded-xl p-1"
										>
											<CiLinkedin className="w-5 h-5" />
										</Link>
									</div> */}
									<h3 className="text-xl font-bold text-center">{person.name}</h3>
									<p className="text-sm text-center">Co-Founder</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
			{/* Join the Movement Footer */}
			<section className="px-4 py-12 bg-gradient-to-b bg-[#c2996a10] md:px-16 lg:px-24">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="mb-4 text-2xl font-bold">Join the Movement</h2>
					<p className="mb-2 text-lg text-gray-900">
						We're more than a platform, we're a community. Whether you're here to learn, compete, or just
						have fun, Murb is the perfect companion for your sports and wellness journey.
					</p>
					<p className="mb-6 text-lg text-gray-900">
						Let's move, play, and grow together—one booking at a time.
					</p>
					<Link href="/">
						<Button variant="custom" className="font-semibold" size={"lg"}>
							Book Now
						</Button>
					</Link>
				</div>
			</section>

			<FAQ />
		</main>
	);
}
