"use client";
import * as React from "react";
import Trending from "./Trending";
import InterestSection from "./InterestSection";
import ContactForm from "./ContactForm";
import { FAQ } from "./FAQ";
import Footer from "./Footer";
import Navbar from "../Buyer/nav/Navbar";
import Carousel from "./Carousel";
import Venues from "./Venues";
import AdventureSports from "./AdventureSports";
import { useSearchParams } from "next/navigation";
import Popular from "./Popular";
import InterestSectionCards from "./InterestSectionCards";
import ExploreResultSection from "./ExploreResultSection";
import EventSearchResult from "./EventSearchResult";
import EventTypeSection from "./EventTypeSection";

export default function LandingPage() {
	const searchParams = useSearchParams();

	const event = searchParams.get("event") as string;

	const getSections = (key: string) => {
		switch (key) {
			case "popular":
				return (
					<div>
						<Popular />
						<InterestSection />
					</div>
				);
			case "trending":
				return (
					<div>
						<Trending />
						<InterestSection />
					</div>
				);
			case "interest":
				return (
					<div>
						<InterestSectionCards />
						<InterestSection />
					</div>
				);
			case "venue":
				return (
					<div>
						<Venues />
						<InterestSection />
					</div>
				);
			case "eventType":
				return (
					<>
						<Trending />
						<Popular />
						<InterestSection />
						<Venues />
						<EventTypeSection />
						<AdventureSports />
					</>
				);
			case "eventTypeFull":
				return (
					<div>
						<EventTypeSection />
						<InterestSection />
					</div>
				);
			case "adventure_sports":
				return (
					<div>
						<AdventureSports />
					</div>
				);
			case "explore":
				return (
					<div>
						<ExploreResultSection />
					</div>
				);
			case "search":
				return (
					<div>
						<EventSearchResult />
					</div>
				);

			default:
				return (
					<>
						<Trending />
						<Popular />
						<InterestSection />
						<Venues />
						<AdventureSports />
					</>
				);
		}
	};

	return (
		<div className="min-h-screen bg-white text-black w-full">
			<Navbar />
			<main className="w-full mt-20 md:mt-32">
				{(!event || event === "eventType") && <Carousel />}

				<div className={`w-full flex flex-col gap-16 ${event ? "px-4" : ""}`}>{getSections(event)}</div>
				<ContactForm />
				<FAQ />
				<Footer />
			</main>
		</div>
	);
}
